"""Génère des créneaux de rendez-vous en semaine (heure de Douala).

Exemple : python manage.py generate_slots --days 21 --hours 9 10 11 14 15 16
Les créneaux déjà existants sont ignorés (commande rejouable sans doublon).
"""

from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.leads.models import AppointmentSlot


class Command(BaseCommand):
    help = "Crée des créneaux de rendez-vous du lundi au vendredi."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=14, help="Nombre de jours à couvrir.")
        parser.add_argument(
            "--hours", type=int, nargs="+", default=[9, 10, 11, 14, 15, 16], help="Heures de début."
        )
        parser.add_argument("--duration", type=int, default=45, help="Durée en minutes.")

    def handle(self, *args, days, hours, duration, **options):
        tz = timezone.get_current_timezone()
        today = timezone.localdate()
        created = 0
        for offset in range(1, days + 1):
            day = today + timedelta(days=offset)
            if day.weekday() >= 5:  # samedi, dimanche
                continue
            for hour in hours:
                start = datetime(day.year, day.month, day.day, hour, 0, tzinfo=tz)
                _, was_created = AppointmentSlot.objects.get_or_create(
                    start=start, defaults={"duration_minutes": duration}
                )
                created += was_created
        self.stdout.write(self.style.SUCCESS(f"{created} créneau(x) créé(s)."))
