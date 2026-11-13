"""reCAPTCHA v3 : vérification côté serveur (réponses de Google simulées)."""

import io
import json
from urllib.error import URLError

import pytest
from django.urls import reverse

from apps.leads import captcha
from apps.leads.models import ContactMessage

URL = reverse("contact-create")


def payload(**overrides):
    data = {
        "full_name": "Test",
        "email": "test@example.com",
        "subject": "Essai",
        "message": "Bonjour",
        "consent": True,
        "captcha": "jeton-du-navigateur",
    }
    data.update(overrides)
    return data


@pytest.fixture
def google(monkeypatch, settings):
    """Active reCAPTCHA et remplace l'appel réseau à Google par une réponse choisie."""
    settings.RECAPTCHA_SECRET_KEY = "secret-de-test"
    settings.RECAPTCHA_MIN_SCORE = 0.5
    state = {"response": {"success": True, "action": "contact", "score": 0.9}, "calls": 0}

    def fake_urlopen(request, timeout):
        state["calls"] += 1
        state["sent"] = request.data.decode()
        if isinstance(state["response"], Exception):
            raise state["response"]
        return io.BytesIO(json.dumps(state["response"]).encode())

    monkeypatch.setattr(captcha, "urlopen", fake_urlopen)
    return state


@pytest.mark.django_db
class TestCaptcha:
    def test_disabled_without_secret(self, api_client, settings):
        settings.RECAPTCHA_SECRET_KEY = ""
        response = api_client.post(URL, payload(captcha=""), format="json")
        assert response.status_code == 201

    def test_valid_token_is_accepted(self, api_client, google):
        response = api_client.post(URL, payload(), format="json")
        assert response.status_code == 201
        assert google["calls"] == 1
        assert "secret=secret-de-test" in google["sent"]
        # Minimisation : l'IP du visiteur n'est pas transmise à Google.
        assert "remoteip" not in google["sent"]

    def test_missing_token_is_refused_without_calling_google(self, api_client, google):
        response = api_client.post(URL, payload(captcha=""), format="json")
        assert response.status_code == 400
        assert response.json()["code"] == "captcha_failed"
        assert google["calls"] == 0
        assert ContactMessage.objects.count() == 0

    @pytest.mark.parametrize(
        "google_response",
        [
            {"success": False, "error-codes": ["invalid-input-response"]},
            {"success": True, "action": "contact", "score": 0.2},  # score trop bas
            {"success": True, "action": "quote", "score": 0.9},  # jeton d'un autre formulaire
        ],
    )
    def test_bad_verdicts_are_refused(self, api_client, google, google_response):
        google["response"] = google_response
        response = api_client.post(URL, payload(), format="json")
        assert response.status_code == 400
        assert ContactMessage.objects.count() == 0

    def test_google_unreachable_fails_closed(self, api_client, google):
        google["response"] = URLError("réseau coupé")
        response = api_client.post(URL, payload(), format="json")
        assert response.status_code == 400

    def test_honeypot_checked_before_captcha(self, api_client, google):
        response = api_client.post(URL, payload(website="http://spam", captcha=""), format="json")
        assert response.status_code == 201
        assert google["calls"] == 0
        assert ContactMessage.objects.count() == 0

    def test_newsletter_confirmation_needs_no_captcha(self, api_client, google):
        response = api_client.post(
            reverse("newsletter-confirm"), {"token": "x" * 43}, format="json"
        )
        # Jeton invalide → 400 « invalid_token », et non un refus reCAPTCHA.
        assert response.json()["code"] == "invalid_token"
        assert google["calls"] == 0
