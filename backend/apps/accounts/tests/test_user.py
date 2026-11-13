import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError


def test_argon2_is_default_hasher():
    """Exigence §11 : les mots de passe sont hachés en Argon2 (hors tests)."""
    from config.settings import base

    assert base.PASSWORD_HASHERS[0].endswith("Argon2PasswordHasher")


def test_custom_user_model_is_active():
    assert settings.AUTH_USER_MODEL == "accounts.User"


@pytest.mark.django_db
def test_email_is_unique():
    User = get_user_model()
    User.objects.create_user(username="a", email="a@example.com", password="x")
    with pytest.raises(IntegrityError):
        User.objects.create_user(username="b", email="a@example.com", password="x")
