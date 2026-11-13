"""Stockage privé : fichiers déposés par les visiteurs, jamais exposés par une URL.

`base_url=None` : Django ne peut pas construire d'URL publique vers ces fichiers.
Ils seront consultables plus tard depuis le back-office (étape 2), via une vue
authentifiée qui vérifie les droits avant de les servir.
"""

import uuid
from pathlib import PurePosixPath

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.utils.deconstruct import deconstructible


@deconstructible
class PrivateStorage(FileSystemStorage):
    def __init__(self, **kwargs):
        kwargs.setdefault("location", settings.PRIVATE_MEDIA_ROOT)
        kwargs["base_url"] = None
        super().__init__(**kwargs)

    def url(self, name):
        raise NotImplementedError("Les fichiers privés n'ont pas d'URL publique.")


private_storage = PrivateStorage()


def quote_attachment_path(instance, filename: str) -> str:
    """Nom aléatoire sur disque : le nom d'origine n'est jamais utilisé comme chemin."""
    suffix = PurePosixPath(filename).suffix.lower()[:10]
    return f"quotes/{instance.quote_id}/{uuid.uuid4().hex}{suffix}"
