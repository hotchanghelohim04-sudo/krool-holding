"""Contrôle strict des pièces jointes (CLAUDE.md §11).

On ne fait confiance ni au nom de fichier ni au type MIME envoyé par le
navigateur : l'extension doit être autorisée ET la signature binaire du
contenu (« magic bytes ») doit correspondre.
"""

from pathlib import PurePosixPath

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# extension -> (type MIME retenu, signatures possibles en début de fichier)
ALLOWED_TYPES: dict[str, tuple[str, tuple[bytes, ...]]] = {
    ".pdf": ("application/pdf", (b"%PDF-",)),
    ".png": ("image/png", (b"\x89PNG\r\n\x1a\n",)),
    ".jpg": ("image/jpeg", (b"\xff\xd8\xff",)),
    ".jpeg": ("image/jpeg", (b"\xff\xd8\xff",)),
    # Formats Office récents : archives ZIP.
    ".docx": (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        (b"PK\x03\x04",),
    ),
    ".xlsx": (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        (b"PK\x03\x04",),
    ),
}


def validate_attachment(uploaded) -> str:
    """Valide un fichier envoyé et renvoie son type MIME retenu."""
    extension = PurePosixPath(uploaded.name or "").suffix.lower()
    if extension not in ALLOWED_TYPES:
        raise ValidationError(_("Type de fichier non autorisé (PDF, PNG, JPG, DOCX, XLSX)."))

    if uploaded.size > settings.LEADS_MAX_ATTACHMENT_SIZE:
        limit_mb = settings.LEADS_MAX_ATTACHMENT_SIZE // (1024 * 1024)
        raise ValidationError(_("Fichier trop volumineux (%(mb)s Mo maximum).") % {"mb": limit_mb})

    if uploaded.size == 0:
        raise ValidationError(_("Le fichier est vide."))

    content_type, signatures = ALLOWED_TYPES[extension]
    uploaded.seek(0)
    head = uploaded.read(16)
    uploaded.seek(0)
    if not any(head.startswith(signature) for signature in signatures):
        raise ValidationError(_("Le contenu du fichier ne correspond pas à son extension."))

    return content_type
