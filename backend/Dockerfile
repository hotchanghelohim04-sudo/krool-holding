# Image du backend Django (API + workers Celery)
FROM python:3.15-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Utilisateur non root (principe du moindre privilège)
RUN groupadd --system app && useradd --system --gid app --home /app app

COPY requirements.txt requirements-dev.txt ./
ARG INSTALL_DEV=false
RUN if [ "$INSTALL_DEV" = "true" ]; then pip install -r requirements-dev.txt; \
    else pip install -r requirements.txt; fi

COPY --chown=app:app . .

# Dossiers écrits à l'exécution (collectstatic, uploads) : seuls endroits modifiables par « app ».
RUN mkdir -p staticfiles media && chown app:app staticfiles media

USER app
EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
