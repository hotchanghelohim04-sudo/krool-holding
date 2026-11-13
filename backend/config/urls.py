"""Routes racine de l'API.

L'admin Django reste un outil de secours : son URL est configurable
pour ne pas être exposée à un chemin prévisible.
"""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path

ADMIN_URL = getattr(settings, "DJANGO_ADMIN_URL", "django-admin/")

urlpatterns = [
    path(ADMIN_URL, admin.site.urls),
    path("api/", include("apps.core.urls")),
]
