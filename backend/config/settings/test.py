"""Réglages des tests : rapides et isolés (pas besoin de Redis)."""

from .base import *  # noqa: F403

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
CELERY_TASK_ALWAYS_EAGER = True

# Pièces jointes des tests dans un dossier temporaire (jamais dans le dépôt).
import tempfile  # noqa: E402
from pathlib import Path  # noqa: E402

PRIVATE_MEDIA_ROOT = Path(tempfile.gettempdir()) / "krool-tests-private"
SITE_URL = "https://example.test"
