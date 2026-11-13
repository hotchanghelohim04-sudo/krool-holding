"""Demandes reçues depuis le site vitrine.

Minimisation des données (CLAUDE.md §11) : on ne stocke que ce qui sert à
répondre au visiteur. Aucune adresse IP n'est enregistrée.
"""

import hashlib
import secrets

from django.db import models
from django.utils import timezone

from .choices import (
    AcademyProfile,
    AppointmentMode,
    LeadStatus,
    Locale,
    Sector,
    Service,
    SiteSize,
)
from .storage import private_storage, quote_attachment_path


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField("reçu le", auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class ContactFields(models.Model):
    full_name = models.CharField("nom complet", max_length=120)
    email = models.EmailField("e-mail")
    phone = models.CharField("téléphone", max_length=30, blank=True)
    company = models.CharField("organisation", max_length=150, blank=True)
    locale = models.CharField("langue", max_length=2, choices=Locale, default=Locale.FR)

    class Meta:
        abstract = True


class QuoteRequest(TimeStampedModel, ContactFields):
    service = models.CharField("service", max_length=40, choices=Service)
    sector = models.CharField("secteur", max_length=30, choices=Sector)
    site_size = models.CharField("taille du site", max_length=10, choices=SiteSize)
    country = models.CharField("pays", max_length=80, blank=True)
    description = models.TextField("description du besoin", max_length=5000)
    status = models.CharField("statut", max_length=12, choices=LeadStatus, default=LeadStatus.NEW)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "demande de devis"
        verbose_name_plural = "demandes de devis"

    def __str__(self) -> str:
        return f"Devis {self.get_service_display()} — {self.company or self.full_name}"


class QuoteAttachment(models.Model):
    quote = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to=quote_attachment_path, storage=private_storage)
    original_name = models.CharField("nom d'origine", max_length=255)
    content_type = models.CharField("type", max_length=120)
    size = models.PositiveIntegerField("taille (octets)")

    class Meta:
        verbose_name = "pièce jointe"
        verbose_name_plural = "pièces jointes"

    def __str__(self) -> str:
        return self.original_name


class ContactMessage(TimeStampedModel, ContactFields):
    subject = models.CharField("objet", max_length=150)
    message = models.TextField("message", max_length=5000)
    status = models.CharField("statut", max_length=12, choices=LeadStatus, default=LeadStatus.NEW)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "message de contact"
        verbose_name_plural = "messages de contact"

    def __str__(self) -> str:
        return f"{self.subject} — {self.full_name}"


class AppointmentSlotQuerySet(models.QuerySet):
    def available(self):
        """Créneaux actifs, à venir et non réservés."""
        return self.filter(
            is_active=True, start__gt=timezone.now(), appointment__isnull=True
        ).order_by("start")


class AppointmentSlot(models.Model):
    """Créneau proposé par l'administrateur (admin Django, puis back-office à l'étape 2)."""

    start = models.DateTimeField("début", unique=True)
    duration_minutes = models.PositiveSmallIntegerField("durée (min)", default=45)
    is_active = models.BooleanField("proposé aux visiteurs", default=True)

    objects = AppointmentSlotQuerySet.as_manager()

    class Meta:
        ordering = ["start"]
        verbose_name = "créneau de rendez-vous"
        verbose_name_plural = "créneaux de rendez-vous"

    def __str__(self) -> str:
        return timezone.localtime(self.start).strftime("%d/%m/%Y %H:%M")


class Appointment(TimeStampedModel, ContactFields):
    # OneToOne : la base de données garantit qu'un créneau n'est réservé qu'une fois.
    slot = models.OneToOneField(
        AppointmentSlot, on_delete=models.PROTECT, related_name="appointment"
    )
    mode = models.CharField("modalité", max_length=10, choices=AppointmentMode)
    topic = models.CharField("sujet", max_length=40, choices=Service)
    message = models.TextField("précisions", max_length=2000, blank=True)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "rendez-vous"
        verbose_name_plural = "rendez-vous"

    def __str__(self) -> str:
        return f"{self.slot} — {self.full_name}"


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class NewsletterSubscriber(TimeStampedModel):
    """Abonné newsletter en double opt-in : actif seulement après clic sur le lien reçu."""

    class Status(models.TextChoices):
        PENDING = "pending", "En attente de confirmation"
        CONFIRMED = "confirmed", "Confirmé"
        UNSUBSCRIBED = "unsubscribed", "Désabonné"

    TOKEN_VALIDITY_DAYS = 7

    email = models.EmailField("e-mail", unique=True)
    locale = models.CharField("langue", max_length=2, choices=Locale, default=Locale.FR)
    status = models.CharField("statut", max_length=12, choices=Status, default=Status.PENDING)
    # Seule l'empreinte du jeton est stockée : une fuite de la base ne permet pas
    # de confirmer des inscriptions à la place des personnes.
    token_hash = models.CharField(max_length=64, blank=True, db_index=True)
    token_sent_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField("confirmé le", null=True, blank=True)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "abonné newsletter"
        verbose_name_plural = "abonnés newsletter"

    def __str__(self) -> str:
        return self.email

    def issue_token(self) -> str:
        """Génère un nouveau jeton (renvoyé une seule fois, jamais stocké en clair)."""
        token = secrets.token_urlsafe(32)
        self.token_hash = hash_token(token)
        self.token_sent_at = timezone.now()
        return token

    def token_is_valid(self) -> bool:
        if not self.token_sent_at:
            return False
        age = timezone.now() - self.token_sent_at
        return age.days < self.TOKEN_VALIDITY_DAYS


class AcademyWaitlistEntry(TimeStampedModel):
    """Personnes à prévenir au lancement de Krool Academy (Phase 2)."""

    email = models.EmailField("e-mail", unique=True)
    full_name = models.CharField("nom", max_length=120, blank=True)
    profile = models.CharField("profil", max_length=15, choices=AcademyProfile)
    locale = models.CharField("langue", max_length=2, choices=Locale, default=Locale.FR)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "inscrit liste d'attente Académie"
        verbose_name_plural = "liste d'attente Académie"

    def __str__(self) -> str:
        return self.email
