"""Envois d'e-mails en tâche de fond (Celery).

Chaque tâche relit l'objet en base à partir de son identifiant : aucune donnée
personnelle ne transite par la file Redis, seulement des identifiants.
"""

from celery import shared_task
from django.conf import settings

from . import emails
from .models import AcademyWaitlistEntry, Appointment, ContactMessage, QuoteRequest

RETRY = {"autoretry_for": (OSError,), "retry_backoff": True, "max_retries": 5}


@shared_task(**RETRY)
def notify_quote(quote_id: int) -> None:
    quote = QuoteRequest.objects.prefetch_related("attachments").get(pk=quote_id)
    emails.send_internal(
        f"Demande de devis DEV-{quote.pk} — {quote.get_service_display()}",
        {
            "Service": quote.get_service_display(),
            "Secteur": quote.get_sector_display(),
            "Taille du site": quote.get_site_size_display(),
            "Organisation": quote.company,
            "Pays": quote.country,
            "Nom": quote.full_name,
            "E-mail": quote.email,
            "Téléphone": quote.phone,
            "Langue": quote.get_locale_display(),
            "Pièces jointes": ", ".join(a.original_name for a in quote.attachments.all()),
            "Description": "\n" + quote.description,
        },
        to=settings.EMAIL_SOLUTIONS,
        reply_to=quote.email,
    )
    emails.send_templated(
        "quote_ack",
        quote.locale,
        quote.email,
        name=quote.full_name,
        service=quote.get_service_display(),
        id=quote.pk,
    )


@shared_task(**RETRY)
def notify_contact(message_id: int) -> None:
    message = ContactMessage.objects.get(pk=message_id)
    emails.send_internal(
        f"Contact — {message.subject}",
        {
            "Nom": message.full_name,
            "Organisation": message.company,
            "E-mail": message.email,
            "Téléphone": message.phone,
            "Langue": message.get_locale_display(),
            "Message": "\n" + message.message,
        },
        to=settings.EMAIL_CONTACT,
        reply_to=message.email,
    )
    emails.send_templated(
        "contact_ack",
        message.locale,
        message.email,
        name=message.full_name,
        subject=message.subject,
    )


@shared_task(**RETRY)
def notify_appointment(appointment_id: int) -> None:
    appointment = Appointment.objects.select_related("slot").get(pk=appointment_id)
    locale = appointment.locale
    emails.send_internal(
        f"Rendez-vous le {emails.format_slot(appointment.slot.start, 'fr')}",
        {
            "Date": emails.format_slot(appointment.slot.start, "fr"),
            "Modalité": appointment.get_mode_display(),
            "Sujet": appointment.get_topic_display(),
            "Nom": appointment.full_name,
            "Organisation": appointment.company,
            "E-mail": appointment.email,
            "Téléphone": appointment.phone,
            "Précisions": appointment.message,
        },
        to=settings.EMAIL_CONTACT,
        reply_to=appointment.email,
    )
    emails.send_templated(
        "appointment_confirmation",
        locale,
        appointment.email,
        name=appointment.full_name,
        date=emails.format_slot(appointment.slot.start, locale),
        duration=appointment.slot.duration_minutes,
        mode=emails.MODE_LABELS.get(locale, emails.MODE_LABELS["fr"])[appointment.mode],
    )


@shared_task(**RETRY)
def send_newsletter_confirmation(email: str, locale: str, token: str) -> None:
    # Exception assumée : le jeton doit transiter jusqu'à l'e-mail, il n'est stocké nulle part.
    emails.send_templated(
        "newsletter_confirm", locale, email, link=emails.confirmation_link(locale, token)
    )


@shared_task(**RETRY)
def notify_waitlist(entry_id: int) -> None:
    entry = AcademyWaitlistEntry.objects.get(pk=entry_id)
    emails.send_templated("waitlist_ack", entry.locale, entry.email)
