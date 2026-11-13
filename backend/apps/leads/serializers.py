import re

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .choices import AppointmentMode, Locale, Service
from .models import (
    AcademyWaitlistEntry,
    AppointmentSlot,
    ContactMessage,
    QuoteRequest,
)
from .validators import validate_attachment

PHONE_RE = re.compile(r"^\+?[0-9 ().-]{6,30}$")


def validate_phone(value: str) -> str:
    if value and not PHONE_RE.match(value):
        raise serializers.ValidationError(_("Numéro de téléphone invalide."))
    return value


class ConsentMixin(serializers.Serializer):
    """Consentement explicite au traitement des données (case à cocher obligatoire)."""

    consent = serializers.BooleanField(write_only=True)

    def validate_consent(self, value: bool) -> bool:
        if value is not True:
            raise serializers.ValidationError(
                _("Votre accord est nécessaire pour traiter la demande.")
            )
        return value

    def validate_email(self, value: str) -> str:
        return value.strip().lower()

    def validate_phone(self, value: str) -> str:
        return validate_phone(value)


class QuoteRequestSerializer(ConsentMixin, serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(allow_empty_file=False, max_length=255),
        required=False,
        max_length=settings.LEADS_MAX_ATTACHMENTS,
        write_only=True,
    )

    class Meta:
        model = QuoteRequest
        fields = [
            "id",
            "service",
            "sector",
            "site_size",
            "country",
            "description",
            "full_name",
            "email",
            "phone",
            "company",
            "locale",
            "consent",
            "attachments",
        ]
        read_only_fields = ["id"]

    def validate_attachments(self, files):
        checked = []
        for uploaded in files:
            try:
                content_type = validate_attachment(uploaded)
            except DjangoValidationError as error:
                raise serializers.ValidationError(
                    f"{uploaded.name} : {error.messages[0]}"
                ) from error
            checked.append((uploaded, content_type))
        return checked


class ContactMessageSerializer(ConsentMixin, serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "company",
            "subject",
            "message",
            "locale",
            "consent",
        ]
        read_only_fields = ["id"]


class AppointmentSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentSlot
        fields = ["id", "start", "duration_minutes"]


class AppointmentRequestSerializer(ConsentMixin, serializers.Serializer):
    slot = serializers.IntegerField(min_value=1)
    mode = serializers.ChoiceField(choices=AppointmentMode.choices)
    topic = serializers.ChoiceField(choices=Service.choices)
    full_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, default="")
    company = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    message = serializers.CharField(max_length=2000, required=False, allow_blank=True, default="")
    locale = serializers.ChoiceField(choices=Locale.choices, default=Locale.FR)


class NewsletterSubscribeSerializer(ConsentMixin, serializers.Serializer):
    email = serializers.EmailField()
    locale = serializers.ChoiceField(choices=Locale.choices, default=Locale.FR)


class NewsletterConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=20, max_length=100)


class AcademyWaitlistSerializer(ConsentMixin, serializers.ModelSerializer):
    class Meta:
        model = AcademyWaitlistEntry
        fields = ["email", "full_name", "profile", "locale", "consent"]
        # L'unicité est gérée dans la vue pour ne pas révéler si une adresse est inscrite.
        extra_kwargs = {"email": {"validators": []}}
