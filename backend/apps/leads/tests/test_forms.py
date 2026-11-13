"""Formulaires devis, contact et liste d'attente : validation, anti-spam, e-mails."""

import pytest
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.throttling import ScopedRateThrottle

from apps.leads.models import AcademyWaitlistEntry, ContactMessage, QuoteRequest

PDF = b"%PDF-1.7\n%test\n"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16


def quote_payload(**overrides):
    data = {
        "service": "hazard-studies",
        "sector": "oil-gas",
        "site_size": "large",
        "country": "Cameroun",
        "description": "Étude de dangers pour un dépôt d'hydrocarbures.",
        "full_name": "Awa Test",
        "email": "Awa.Test@Example.com",
        "phone": "+237 600 00 00 00",
        "company": "Dépôt Test SA",
        "locale": "fr",
        "consent": "true",
    }
    data.update(overrides)
    return data


@pytest.mark.django_db
class TestQuote:
    url = reverse("quote-create")

    def test_valid_quote_with_attachment(self, api_client, django_capture_on_commit_callbacks):
        payload = quote_payload(attachments=[SimpleUploadedFile("plan.pdf", PDF)])
        with django_capture_on_commit_callbacks(execute=True):
            response = api_client.post(self.url, payload, format="multipart")

        assert response.status_code == 201, response.json()
        quote = QuoteRequest.objects.get()
        assert response.json()["reference"] == f"DEV-{quote.pk}"
        assert quote.email == "awa.test@example.com"  # normalisé
        attachment = quote.attachments.get()
        assert attachment.original_name == "plan.pdf"
        assert attachment.content_type == "application/pdf"
        # Nom aléatoire sur disque, jamais le nom envoyé par le visiteur.
        assert "plan" not in attachment.file.name

        assert len(mail.outbox) == 2
        internal, ack = mail.outbox
        assert internal.to == ["solutions@krool-holding.com"]
        assert internal.reply_to == ["awa.test@example.com"]
        assert ack.to == ["awa.test@example.com"]
        assert f"DEV-{quote.pk}" in ack.body

    def test_english_acknowledgement(self, api_client, django_capture_on_commit_callbacks):
        with django_capture_on_commit_callbacks(execute=True):
            api_client.post(self.url, quote_payload(locale="en"), format="multipart")
        assert mail.outbox[1].subject == "We have received your quote request"

    def test_fake_pdf_is_rejected(self, api_client):
        fake = SimpleUploadedFile("facture.pdf", b"MZ\x90\x00 programme windows")
        response = api_client.post(self.url, quote_payload(attachments=[fake]), format="multipart")
        assert response.status_code == 400
        assert "attachments" in response.json()
        assert QuoteRequest.objects.count() == 0

    def test_forbidden_extension_is_rejected(self, api_client):
        exe = SimpleUploadedFile("outil.exe", b"MZ\x90\x00")
        response = api_client.post(self.url, quote_payload(attachments=[exe]), format="multipart")
        assert response.status_code == 400

    def test_too_many_attachments(self, api_client):
        files = [SimpleUploadedFile(f"p{i}.png", PNG) for i in range(4)]
        response = api_client.post(self.url, quote_payload(attachments=files), format="multipart")
        assert response.status_code == 400

    def test_oversized_attachment(self, api_client, settings):
        settings.LEADS_MAX_ATTACHMENT_SIZE = 10
        big = SimpleUploadedFile("gros.pdf", PDF + b"x" * 50)
        response = api_client.post(self.url, quote_payload(attachments=[big]), format="multipart")
        assert response.status_code == 400

    def test_consent_is_mandatory(self, api_client):
        response = api_client.post(self.url, quote_payload(consent="false"), format="multipart")
        assert response.status_code == 400
        assert "consent" in response.json()

    def test_unknown_service_is_rejected(self, api_client):
        response = api_client.post(self.url, quote_payload(service="piratage"), format="multipart")
        assert response.status_code == 400

    def test_honeypot_fakes_success_without_saving(self, api_client):
        response = api_client.post(
            self.url, quote_payload(website="http://spam"), format="multipart"
        )
        assert response.status_code == 201
        assert QuoteRequest.objects.count() == 0
        assert len(mail.outbox) == 0


@pytest.mark.django_db
class TestContact:
    url = reverse("contact-create")

    def payload(self, **overrides):
        data = {
            "full_name": "Jean Test",
            "email": "jean@example.com",
            "subject": "Audit SST",
            "message": "Bonjour, nous souhaitons un audit.",
            "locale": "fr",
            "consent": True,
        }
        data.update(overrides)
        return data

    def test_valid_message(self, api_client, django_capture_on_commit_callbacks):
        with django_capture_on_commit_callbacks(execute=True):
            response = api_client.post(self.url, self.payload(), format="json")
        assert response.status_code == 201
        assert ContactMessage.objects.count() == 1
        assert mail.outbox[0].to == ["contact@krool-holding.com"]

    def test_header_injection_is_neutralised(self, api_client, django_capture_on_commit_callbacks):
        payload = self.payload(subject="Bonjour\r\nBcc: victime@example.com")
        with django_capture_on_commit_callbacks(execute=True):
            response = api_client.post(self.url, payload, format="json")
        assert response.status_code == 201
        internal = mail.outbox[0]
        assert "\n" not in internal.subject and "\r" not in internal.subject
        assert internal.bcc == []

    def test_invalid_phone(self, api_client):
        response = api_client.post(self.url, self.payload(phone="<script>"), format="json")
        assert response.status_code == 400

    def test_rate_limit(self, api_client, monkeypatch):
        monkeypatch.setitem(ScopedRateThrottle.THROTTLE_RATES, "leads", "2/hour")
        codes = [
            api_client.post(self.url, self.payload(), format="json").status_code for _ in range(3)
        ]
        assert codes == [201, 201, 429]


@pytest.mark.django_db
class TestAcademyWaitlist:
    url = reverse("academy-waitlist")

    def test_duplicate_is_silent(self, api_client, django_capture_on_commit_callbacks):
        payload = {"email": "lea@example.com", "profile": "student", "consent": True}
        with django_capture_on_commit_callbacks(execute=True):
            first = api_client.post(self.url, payload, format="json")
            second = api_client.post(
                self.url, {**payload, "email": "LEA@example.com"}, format="json"
            )
        # Même réponse : on ne révèle pas qu'une adresse est déjà inscrite.
        assert first.status_code == second.status_code == 201
        assert first.json() == second.json()
        assert AcademyWaitlistEntry.objects.count() == 1
        assert len(mail.outbox) == 1
