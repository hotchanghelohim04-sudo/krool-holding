"""Rendez-vous : créneaux disponibles et impossibilité de double réservation."""

from datetime import timedelta

import pytest
from django.core import mail
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone

from apps.leads.models import Appointment, AppointmentSlot


def booking(slot_id, **overrides):
    data = {
        "slot": slot_id,
        "mode": "video",
        "topic": "industrial-safety",
        "full_name": "Paul Test",
        "email": "paul@example.com",
        "locale": "fr",
        "consent": True,
    }
    data.update(overrides)
    return data


@pytest.fixture
def future_slot(db):
    return AppointmentSlot.objects.create(start=timezone.now() + timedelta(days=2))


@pytest.mark.django_db
class TestSlots:
    url = reverse("appointment-slots")

    def test_lists_only_available_future_slots(self, api_client, future_slot):
        now = timezone.now()
        AppointmentSlot.objects.create(start=now - timedelta(days=1))  # passé
        AppointmentSlot.objects.create(start=now + timedelta(days=3), is_active=False)
        AppointmentSlot.objects.create(start=now + timedelta(days=120))  # trop loin
        booked = AppointmentSlot.objects.create(start=now + timedelta(days=4))
        Appointment.objects.create(
            slot=booked, mode="phone", topic="consulting", full_name="X", email="x@example.com"
        )

        response = api_client.get(self.url)
        assert response.status_code == 200
        assert [s["id"] for s in response.json()] == [future_slot.id]
        # Aucune donnée personnelle dans la liste publique.
        assert set(response.json()[0]) == {"id", "start", "duration_minutes"}


@pytest.mark.django_db
class TestBooking:
    url = reverse("appointment-create")

    def test_booking_confirms_and_emails(
        self, api_client, future_slot, django_capture_on_commit_callbacks
    ):
        with django_capture_on_commit_callbacks(execute=True):
            response = api_client.post(self.url, booking(future_slot.id), format="json")
        assert response.status_code == 201
        assert Appointment.objects.get().slot == future_slot
        assert [m.to for m in mail.outbox] == [["contact@krool-holding.com"], ["paul@example.com"]]
        assert "visioconférence" in mail.outbox[1].body

    def test_slot_cannot_be_booked_twice(self, api_client, future_slot):
        first = api_client.post(self.url, booking(future_slot.id), format="json")
        second = api_client.post(
            self.url, booking(future_slot.id, email="autre@example.com"), format="json"
        )
        assert first.status_code == 201
        assert second.status_code == 409
        assert second.json()["code"] == "slot_unavailable"
        assert Appointment.objects.count() == 1

    def test_past_slot_is_refused(self, api_client):
        past = AppointmentSlot.objects.create(start=timezone.now() - timedelta(hours=1))
        response = api_client.post(self.url, booking(past.id), format="json")
        assert response.status_code == 409

    def test_inactive_or_unknown_slot_is_refused(self, api_client):
        inactive = AppointmentSlot.objects.create(
            start=timezone.now() + timedelta(days=1), is_active=False
        )
        assert api_client.post(self.url, booking(inactive.id), format="json").status_code == 409
        assert api_client.post(self.url, booking(999999), format="json").status_code == 409


@pytest.mark.django_db
def test_generate_slots_weekdays_only_and_idempotent():
    call_command("generate_slots", days=14, hours=[9, 15])
    first_count = AppointmentSlot.objects.count()
    call_command("generate_slots", days=14, hours=[9, 15])

    assert AppointmentSlot.objects.count() == first_count == 20  # 10 jours ouvrés x 2
    weekdays = {timezone.localtime(s.start).weekday() for s in AppointmentSlot.objects.all()}
    assert weekdays <= {0, 1, 2, 3, 4}
