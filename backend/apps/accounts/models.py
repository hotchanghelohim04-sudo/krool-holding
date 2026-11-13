"""Modèle utilisateur personnalisé.

Défini dès l'étape 0 : changer de modèle utilisateur après la première
migration est très coûteux avec Django. Les champs métier (rôles,
organisation B2B, 2FA…) seront ajoutés aux étapes 2 et 3.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField("adresse e-mail", unique=True)

    class Meta:
        verbose_name = "utilisateur"
        verbose_name_plural = "utilisateurs"

    def __str__(self) -> str:
        return self.email or self.username
