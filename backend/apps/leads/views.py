"""API publique des formulaires du site vitrine.

Garde-fous communs (CLAUDE.md §7 et §11) :
- champ piège « website » invisible pour les humains : s'il est rempli, on
  répond comme si tout allait bien, sans rien enregistrer ni envoyer ;
- limitation de débit par IP (portée « leads ») ;
- aucune authentification ni cookie de session : ces vues n'agissent sur
  aucun compte, il n'y a donc rien à protéger par CSRF ;
- réponses identiques qu'une adresse soit déjà connue ou non (pas d'énumération).
"""

from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import tasks
from .models import (
    AcademyWaitlistEntry,
    Appointment,
    AppointmentSlot,
    NewsletterSubscriber,
    QuoteAttachment,
    hash_token,
)
from .serializers import (
    AcademyWaitlistSerializer,
    AppointmentRequestSerializer,
    AppointmentSlotSerializer,
    ContactMessageSerializer,
    NewsletterConfirmSerializer,
    NewsletterSubscribeSerializer,
    QuoteRequestSerializer,
)

HONEYPOT_FIELD = "website"
# Délai minimal avant de renvoyer un e-mail de confirmation à la même adresse.
NEWSLETTER_RESEND_DELAY = timedelta(minutes=5)
SLOTS_HORIZON = timedelta(days=60)


class PublicFormView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "leads"
    success_status = status.HTTP_201_CREATED

    def post(self, request):
        if request.data.get(HONEYPOT_FIELD):
            return Response(self.decoy_body(), status=self.success_status)
        return self.handle(request)

    def decoy_body(self) -> dict:
        return {"status": "received"}

    def handle(self, request) -> Response:  # pragma: no cover - surchargé
        raise NotImplementedError


class QuoteRequestView(PublicFormView):
    def handle(self, request):
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        files = serializer.validated_data.pop("attachments", [])
        serializer.validated_data.pop("consent")

        with transaction.atomic():
            quote = serializer.save()
            for uploaded, content_type in files:
                QuoteAttachment.objects.create(
                    quote=quote,
                    file=uploaded,
                    original_name=uploaded.name[:255],
                    content_type=content_type,
                    size=uploaded.size,
                )
            transaction.on_commit(lambda: tasks.notify_quote.delay(quote.pk))

        return Response({"status": "received", "reference": f"DEV-{quote.pk}"}, status=201)

    def decoy_body(self):
        return {"status": "received", "reference": "DEV-0"}


class ContactMessageView(PublicFormView):
    def handle(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.validated_data.pop("consent")
        with transaction.atomic():
            message = serializer.save()
            transaction.on_commit(lambda: tasks.notify_contact.delay(message.pk))
        return Response({"status": "received"}, status=201)


class AppointmentSlotListView(ListAPIView):
    """Créneaux libres des 60 prochains jours (aucune donnée personnelle)."""

    authentication_classes: list = []
    permission_classes = [AllowAny]
    serializer_class = AppointmentSlotSerializer
    pagination_class = None

    def get_queryset(self):
        return AppointmentSlot.objects.available().filter(start__lte=timezone.now() + SLOTS_HORIZON)


class AppointmentBookingView(PublicFormView):
    def handle(self, request):
        serializer = AppointmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        data.pop("consent")
        slot_id = data.pop("slot")
        unavailable = Response(
            {"code": "slot_unavailable", "detail": "Ce créneau n'est plus disponible."},
            status=status.HTTP_409_CONFLICT,
        )

        try:
            with transaction.atomic():
                # Verrou sur la ligne du créneau : deux réservations simultanées
                # ne peuvent pas le prendre toutes les deux.
                slot = (
                    AppointmentSlot.objects.select_for_update()
                    .filter(pk=slot_id, is_active=True, start__gt=timezone.now())
                    .first()
                )
                if slot is None or Appointment.objects.filter(slot=slot).exists():
                    return unavailable
                appointment = Appointment.objects.create(slot=slot, **data)
                transaction.on_commit(lambda: tasks.notify_appointment.delay(appointment.pk))
        except IntegrityError:
            return unavailable

        return Response({"status": "confirmed", "start": slot.start}, status=201)


class NewsletterSubscribeView(PublicFormView):
    success_status = status.HTTP_202_ACCEPTED

    def decoy_body(self):
        return {"status": "pending"}

    def handle(self, request):
        serializer = NewsletterSubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        locale = serializer.validated_data["locale"]

        with transaction.atomic():
            subscriber, _ = NewsletterSubscriber.objects.select_for_update().get_or_create(
                email=email, defaults={"locale": locale}
            )
            recently_sent = (
                subscriber.token_sent_at
                and timezone.now() - subscriber.token_sent_at < NEWSLETTER_RESEND_DELAY
            )
            if subscriber.status != NewsletterSubscriber.Status.CONFIRMED and not recently_sent:
                token = subscriber.issue_token()
                subscriber.status = NewsletterSubscriber.Status.PENDING
                subscriber.locale = locale
                subscriber.save()
                transaction.on_commit(
                    lambda: tasks.send_newsletter_confirmation.delay(email, locale, token)
                )

        # Même réponse dans tous les cas : on ne révèle pas si l'adresse est déjà inscrite.
        return Response({"status": "pending"}, status=status.HTTP_202_ACCEPTED)


class NewsletterConfirmView(PublicFormView):
    success_status = status.HTTP_200_OK

    def decoy_body(self):
        return {"status": "confirmed"}

    def handle(self, request):
        serializer = NewsletterConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_hash = hash_token(serializer.validated_data["token"])

        with transaction.atomic():
            subscriber = (
                NewsletterSubscriber.objects.select_for_update()
                .filter(token_hash=token_hash, status=NewsletterSubscriber.Status.PENDING)
                .first()
            )
            if subscriber is None or not subscriber.token_is_valid():
                return Response(
                    {"code": "invalid_token", "detail": "Lien invalide, expiré ou déjà utilisé."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            subscriber.status = NewsletterSubscriber.Status.CONFIRMED
            subscriber.confirmed_at = timezone.now()
            subscriber.token_hash = ""  # usage unique
            subscriber.save()

        return Response({"status": "confirmed"}, status=status.HTTP_200_OK)


class AcademyWaitlistView(PublicFormView):
    def handle(self, request):
        serializer = AcademyWaitlistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        data.pop("consent")
        with transaction.atomic():
            entry, created = AcademyWaitlistEntry.objects.get_or_create(
                email=data.pop("email"), defaults=data
            )
            if created:
                transaction.on_commit(lambda: tasks.notify_waitlist.delay(entry.pk))
        return Response({"status": "received"}, status=201)
