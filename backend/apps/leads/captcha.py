"""Vérification Google reCAPTCHA v3 (invisible, par score).

- Désactivée tant que RECAPTCHA_SECRET_KEY est vide (développement, tests).
- Activée : le jeton envoyé par le navigateur est vérifié auprès de Google ; on exige
  succès, action attendue et score ≥ RECAPTCHA_MIN_SCORE.
- Google injoignable ou réponse illisible : la demande est refusée (sécurité par défaut)
  et l'incident est journalisé.
- Minimisation : l'adresse IP du visiteur n'est pas transmise à Google (paramètre facultatif).
"""

import json
import logging
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings

logger = logging.getLogger(__name__)

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


def captcha_enabled() -> bool:
    return bool(settings.RECAPTCHA_SECRET_KEY)


def verify_captcha(token: str, action: str) -> bool:
    if not captcha_enabled():
        return True
    if not token or len(token) > 4000:
        return False

    payload = urlencode({"secret": settings.RECAPTCHA_SECRET_KEY, "response": token}).encode()
    try:
        with urlopen(Request(VERIFY_URL, data=payload), timeout=5) as response:  # noqa: S310 — URL fixe en https
            result = json.load(response)
    except (URLError, TimeoutError, ValueError, OSError):
        logger.warning(
            "Vérification reCAPTCHA impossible (Google injoignable ou réponse invalide)."
        )
        return False

    ok = (
        result.get("success") is True
        and result.get("action") == action
        and float(result.get("score", 0)) >= settings.RECAPTCHA_MIN_SCORE
    )
    if not ok:
        logger.info(
            "reCAPTCHA refusé : action=%s score=%s erreurs=%s",
            result.get("action"),
            result.get("score"),
            result.get("error-codes"),
        )
    return ok
