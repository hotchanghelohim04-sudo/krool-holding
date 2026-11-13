"""Réglages communs à tous les environnements.

Toutes les valeurs sensibles viennent des variables d'environnement (voir `.env.example`).
"""

from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
# En local, on lit backend/.env s'il existe ; en conteneur, les variables sont injectées.
environ.Env.read_env(BASE_DIR / ".env", overwrite=False)

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env.bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])
# Chemin de l'admin Django de secours (à rendre non prévisible en prod).
DJANGO_ADMIN_URL = env("DJANGO_ADMIN_URL", default="django-admin/")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Tiers
    "rest_framework",
    "corsheaders",
    # Applications du projet
    "apps.accounts",
    "apps.core",
    "apps.leads",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --- Base de données (PostgreSQL) ---
DATABASES = {"default": env.db("DATABASE_URL")}
DATABASES["default"]["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60)
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Authentification ---
AUTH_USER_MODEL = "accounts.User"
# Argon2 en premier : les nouveaux mots de passe sont hachés en Argon2id.
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Langues : FR/EN natifs ---
LANGUAGE_CODE = "fr"
LANGUAGES = [("fr", "Français"), ("en", "English")]
TIME_ZONE = "Africa/Douala"
USE_I18N = True
USE_TZ = True

# --- Fichiers statiques et médias ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"
# Fichiers confidentiels (pièces jointes des devis) : jamais servis par une URL.
PRIVATE_MEDIA_ROOT = env.path("PRIVATE_MEDIA_ROOT", default=BASE_DIR / "private")
# Taille maximale des uploads (contrôle strict, cf. CLAUDE.md §11)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
# Pièces jointes des devis : 3 fichiers max, 5 Mo chacun.
LEADS_MAX_ATTACHMENTS = 3
LEADS_MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024

# --- Django REST Framework ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/minute",
        "user": "240/minute",
        # Formulaires publics (devis, contact, RDV, newsletter…) : par adresse IP.
        "leads": env("THROTTLE_LEADS", default="10/hour"),
    },
    # Nombre de proxys de confiance devant Django (Caddy en prod, Next.js en dev)
    # pour lire la vraie IP du visiteur dans X-Forwarded-For.
    "NUM_PROXIES": env.int("DRF_NUM_PROXIES", default=0) or None,
}

# --- CORS / CSRF : strict, origines listées explicitement ---
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# --- Cookies et en-têtes de sécurité (valeurs de base, durcies en prod) ---
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"

# --- Cache / Celery (Redis) ---
REDIS_URL = env("REDIS_URL", default="redis://localhost:6379/0")
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default=REDIS_URL)
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default=REDIS_URL)
CELERY_TASK_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TIMEZONE = TIME_ZONE

# --- E-mails ---
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="localhost")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="Krool Holding <no-reply@krool-holding.com>")

# Boîtes destinataires par fonction (CLAUDE.md §6).
EMAIL_CONTACT = env("EMAIL_CONTACT", default="contact@krool-holding.com")
EMAIL_SOLUTIONS = env("EMAIL_SOLUTIONS", default="solutions@krool-holding.com")
EMAIL_SUPPORT = env("EMAIL_SUPPORT", default="support@krool-holding.com")

# --- Google reCAPTCHA v3 (formulaires publics) : désactivé si la clé secrète est vide ---
RECAPTCHA_SECRET_KEY = env("RECAPTCHA_SECRET_KEY", default="")
RECAPTCHA_MIN_SCORE = env.float("RECAPTCHA_MIN_SCORE", default=0.5)

# URL publique du site (liens dans les e-mails : confirmation newsletter…).
SITE_URL = env("SITE_URL", default="http://localhost:3000").rstrip("/")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": env("LOG_LEVEL", default="INFO")},
}
