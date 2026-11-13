"""Textes des e-mails (texte brut, FR/EN).

TODO-CONTENU : formulations provisoires, à relire par Lembe.
Les e-mails internes (vers les boîtes du cabinet) sont en français.
"""

from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone

SIGNATURE = {
    "fr": "\n\n—\nKrool Holding\nSécurité industrielle · HSE · Conseil\n",
    "en": "\n\n—\nKrool Holding\nIndustrial safety · HSE · Consulting\n",
}

TEMPLATES = {
    "quote_ack": {
        "fr": (
            "Nous avons bien reçu votre demande de devis",
            "Bonjour {name},\n\nMerci pour votre demande de devis concernant « {service} ». "
            "Un consultant l'étudie et revient vers vous sous 2 jours ouvrés.\n\n"
            "Référence de votre demande : DEV-{id}",
        ),
        "en": (
            "We have received your quote request",
            'Hello {name},\n\nThank you for your quote request regarding "{service}". '
            "A consultant is reviewing it and will get back to you within 2 business days.\n\n"
            "Your request reference: DEV-{id}",
        ),
    },
    "contact_ack": {
        "fr": (
            "Nous avons bien reçu votre message",
            "Bonjour {name},\n\nMerci pour votre message « {subject} ». "
            "Nous vous répondons dans les meilleurs délais.",
        ),
        "en": (
            "We have received your message",
            'Hello {name},\n\nThank you for your message "{subject}". '
            "We will get back to you as soon as possible.",
        ),
    },
    "appointment_confirmation": {
        "fr": (
            "Votre rendez-vous avec Krool Holding est confirmé",
            "Bonjour {name},\n\nVotre rendez-vous est confirmé :\n"
            "- Date : {date} (heure de Douala, UTC+1)\n- Durée : {duration} minutes\n"
            "- Modalité : {mode}\n\nLes détails de connexion ou l'adresse vous seront "
            "communiqués la veille. Pour annuler ou déplacer, répondez simplement à cet e-mail.",
        ),
        "en": (
            "Your appointment with Krool Holding is confirmed",
            "Hello {name},\n\nYour appointment is confirmed:\n"
            "- Date: {date} (Douala time, UTC+1)\n- Duration: {duration} minutes\n"
            "- Format: {mode}\n\nConnection details or the address will be sent the day "
            "before. To cancel or reschedule, simply reply to this email.",
        ),
    },
    "newsletter_confirm": {
        "fr": (
            "Confirmez votre inscription à la lettre d'information",
            "Bonjour,\n\nPour confirmer votre inscription à la lettre d'information de "
            "Krool Holding, cliquez sur ce lien (valable 7 jours) :\n\n{link}\n\n"
            "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail : "
            "aucune inscription ne sera enregistrée.",
        ),
        "en": (
            "Please confirm your newsletter subscription",
            "Hello,\n\nTo confirm your subscription to the Krool Holding newsletter, "
            "click this link (valid for 7 days):\n\n{link}\n\n"
            "If you did not request this, simply ignore this email: "
            "no subscription will be recorded.",
        ),
    },
    "waitlist_ack": {
        "fr": (
            "Vous serez prévenu(e) du lancement de Krool Academy",
            "Bonjour,\n\nMerci de votre intérêt pour Krool Academy, notre plateforme de "
            "formation aux risques industriels. Nous vous écrirons dès son ouverture.",
        ),
        "en": (
            "You will be notified when Krool Academy launches",
            "Hello,\n\nThank you for your interest in Krool Academy, our industrial risk "
            "training platform. We will email you as soon as it opens.",
        ),
    },
}

MODE_LABELS = {
    "fr": {"video": "visioconférence", "phone": "téléphone", "on-site": "dans nos locaux"},
    "en": {"video": "video call", "phone": "phone call", "on-site": "at our offices"},
}


def _single_line(value: str, limit: int = 120) -> str:
    """Les en-têtes d'e-mail ne doivent jamais contenir de saut de ligne (injection)."""
    return " ".join(str(value).split())[:limit]


def send_templated(key: str, locale: str, to: str, **context) -> None:
    locale = locale if locale in ("fr", "en") else "fr"
    subject, body = TEMPLATES[key][locale]
    EmailMessage(
        subject=_single_line(subject),
        body=body.format(**context) + SIGNATURE[locale],
        to=[to],
    ).send()


def send_internal(subject: str, lines: dict[str, str], to: str, reply_to: str) -> None:
    body = "\n".join(f"{label} : {value}" for label, value in lines.items() if value)
    EmailMessage(
        subject=_single_line(f"[Site] {subject}"),
        body=body,
        to=[to],
        reply_to=[reply_to],
    ).send()


def format_slot(start, locale: str) -> str:
    local = timezone.localtime(start)
    return local.strftime("%d/%m/%Y à %H:%M" if locale == "fr" else "%Y-%m-%d at %H:%M")


def confirmation_link(locale: str, token: str) -> str:
    return f"{settings.SITE_URL}/{locale}/newsletter/confirmation?token={token}"
