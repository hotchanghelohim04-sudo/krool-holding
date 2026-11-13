import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_health_ok(client):
    response = client.get(reverse("health"))
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": True}


@pytest.mark.django_db
def test_api_requires_authentication_by_default(client):
    """Toute nouvelle vue DRF est privée par défaut (sécurité par défaut)."""
    from rest_framework.permissions import IsAuthenticated
    from rest_framework.settings import api_settings

    assert IsAuthenticated in api_settings.DEFAULT_PERMISSION_CLASSES
