# Krool Holding — site web et Krool Academy

Monorepo du site vitrine et de la plateforme de formation de Krool Holding.
Cahier des charges et règles de travail : [`CLAUDE.md`](CLAUDE.md).

| Dossier | Contenu |
| --- | --- |
| `frontend/` | Next.js 16 (App Router) + TypeScript + Tailwind v4 + next-intl (FR/EN) |
| `backend/` | Django 5.2 + DRF + PostgreSQL + Celery/Redis |
| `content/` | Contenus éditoriaux provisoires (`TODO-CONTENU`) |
| `docs/` | Documentation d'architecture ([i18n](docs/architecture/i18n.md), [design tokens](docs/design-tokens.md)) |
| `infra/` | Configuration serveur (Caddy) |

## Démarrage avec Docker (recommandé)

```bash
cp .env.example .env        # puis renseigner DJANGO_SECRET_KEY et POSTGRES_PASSWORD
docker compose up --build
```

- Site : http://localhost:3000 (redirige vers `/fr`)
- API : http://localhost:8000/api/health/

Sous Windows, le script suivant fait tout d'un coup (crée `.env` avec des secrets aléatoires,
construit, démarre, attend les healthchecks et teste l'API et le site) :

```powershell
powershell -ExecutionPolicy Bypass -File infra\scripts\verifier-docker.ps1
```

En production : `DJANGO_SETTINGS_MODULE=config.settings.prod`, `SITE_DOMAIN` renseigné, puis
`docker compose --profile prod up -d --build` (ajoute Caddy et le HTTPS automatique).

### Formulaires et administration (étape 1)

Le site envoie ses formulaires à l'API Django (`/api/quotes`, `/api/contact`, `/api/appointments`,
`/api/newsletter/*`, `/api/academy/waitlist`). En local, les e-mails ne partent pas : ils
s'affichent dans les journaux du worker (`docker compose logs -f worker`).

```bash
# Compte administrateur (admin Django de secours : http://localhost:8000/django-admin/)
docker compose exec backend python manage.py createsuperuser
# Créneaux de rendez-vous du lundi au vendredi (modifiables ensuite dans l'admin)
docker compose exec backend python manage.py generate_slots --days 21
```

Les demandes (devis et pièces jointes, rendez-vous, messages, abonnés, liste d'attente) se
consultent dans l'admin Django en attendant le back-office de l'étape 2. Les pièces jointes
sont stockées dans un volume privé (`privatedata`), jamais exposé par une URL.

## Démarrage sans Docker

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

**Backend** (PostgreSQL et Redis doivent tourner localement)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows (Linux/macOS : source .venv/bin/activate)
pip install -r requirements-dev.txt
cp ../.env.example .env           # adapter DATABASE_URL
python manage.py migrate
python manage.py runserver
```

## Qualité

| Commande | Rôle |
| --- | --- |
| `npm run lint` / `npm run typecheck` / `npm run build` | Frontend |
| `npm test` | Cohérence des contenus (FR/EN, slugs, codes partagés avec l'API) |
| `pytest` / `ruff check .` / `ruff format --check .` | Backend |
| `pip-audit -r requirements.txt` / `npm audit --omit=dev` | Audit des dépendances |

La CI GitHub Actions (`.github/workflows/ci.yml`) exécute tout cela, plus un scan de secrets (gitleaks).
