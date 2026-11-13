"""Vues techniques du socle."""

from django.db import connection
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([])
def health(request: Request) -> Response:
    """Sonde de santé utilisée par Docker et la supervision.

    Ne divulgue aucune information interne : seulement l'état global.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        database_ok = True
    except Exception:  # noqa: BLE001 — on veut un 503 propre, pas une trace
        database_ok = False

    status_code = 200 if database_ok else 503
    return Response(
        {"status": "ok" if database_ok else "degraded", "database": database_ok},
        status=status_code,
    )
