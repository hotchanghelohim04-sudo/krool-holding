"""Newsletter en double opt-in : jeton à usage unique, expiration, non-énumération."""

import re
from datetime import timedelta

import pytest
from django.core import mail
from django.urls import reverse
from django.utils import timezone

from apps.leads.models import NewsletterSubscriber

SUBSCRIBE = reverse("newsletter-subscribe")
CONFIRM = reverse("newsletter-confirm")


def subscribe(client, capture, email="nina@example.com", locale="fr"):
    with capture(execute=True):
        return client.post(
            SUBSCRIBE, {"email": email, "locale": locale, "consent": True}, format="json"
        )


def token_from_last_email() -> str:
    match = re.search(r"token=([\w-]+)", mail.outbox[-1].body)
    assert match, mail.outbox[-1].body
    return match.group(1)


@pytest.mark.django_db
class TestNewsletter:
    def test_full_double_opt_in(self, api_client, django_capture_on_commit_callbacks):
        response = subscribe(api_client, django_capture_on_commit_callbacks)
        assert response.status_code == 202

        subscriber = NewsletterSubscriber.objects.get()
        assert subscriber.status == "pending"
        token = token_from_last_email()
        assert "https://example.test/fr/newsletter/confirmation?token=" in mail.outbox[-1].body
        # Le jeton n'est jamais stocké en clair.
        assert token not in subscriber.token_hash

        confirm = api_client.post(CONFIRM, {"token": token}, format="json")
        assert confirm.status_code == 200
        subscriber.refresh_from_db()
        assert subscriber.status == "confirmed"
        assert subscriber.confirmed_at is not None

        # Usage unique.
        again = api_client.post(CONFIRM, {"token": token}, format="json")
        assert again.status_code == 400
        assert again.json()["code"] == "invalid_token"

    def test_expired_token(self, api_client, django_capture_on_commit_callbacks):
        subscribe(api_client, django_capture_on_commit_callbacks)
        token = token_from_last_email()
        NewsletterSubscriber.objects.update(token_sent_at=timezone.now() - timedelta(days=8))
        response = api_client.post(CONFIRM, {"token": token}, format="json")
        assert response.status_code == 400

    def test_wrong_token(self, api_client):
        response = api_client.post(CONFIRM, {"token": "x" * 43}, format="json")
        assert response.status_code == 400

    def test_confirmed_address_gets_same_response_and_no_email(
        self, api_client, django_capture_on_commit_callbacks
    ):
        NewsletterSubscriber.objects.create(email="nina@example.com", status="confirmed")
        response = subscribe(api_client, django_capture_on_commit_callbacks)
        assert response.status_code == 202
        assert response.json() == {"status": "pending"}
        assert len(mail.outbox) == 0

    def test_no_resend_flood(self, api_client, django_capture_on_commit_callbacks):
        subscribe(api_client, django_capture_on_commit_callbacks)
        subscribe(api_client, django_capture_on_commit_callbacks)
        assert len(mail.outbox) == 1

    def test_english_link(self, api_client, django_capture_on_commit_callbacks):
        subscribe(api_client, django_capture_on_commit_callbacks, locale="en")
        assert "/en/newsletter/confirmation?token=" in mail.outbox[-1].body
        assert mail.outbox[-1].subject == "Please confirm your newsletter subscription"
