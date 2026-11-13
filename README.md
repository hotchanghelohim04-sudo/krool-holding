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
| `pytest` / `ruff check .` / `ruff format --check .` | Backend |
| `pip-audit -r requirements.txt` / `npm audit --omit=dev` | Audit des dépendances |

La CI GitHub Actions (`.github/workflows/ci.yml`) exécute tout cela, plus un scan de secrets (gitleaks).
