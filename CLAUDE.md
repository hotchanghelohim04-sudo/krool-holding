# Krool Holding — Site web + plateforme de formation

> Lire ce fichier en entier au début de chaque session. Mettre à jour la section 13 (Avancement) en fin de session.

## 1. Contexte
- **Krool Holding** : cabinet camerounais (immatriculation en cours) de sécurité industrielle et de conseil. Deviendra plus tard la société mère d'un groupe.
- **Services** : sécurité industrielle ; santé et sécurité au travail (SST) ; conseil ; études de dangers ; études d'impact environnemental et social (EIES) ; formation aux risques industriels ; gestion de l'environnement ; qualité industrielle ; études de projet.
- **Clients** : industries, institutions, usines. **Zone** : Cameroun, CEMAC, international.
- **Produit** : un site vitrine de style cabinet américain innovant (réf. BSI Group, Shirley Parsons, BakerRisk) **+** une plateforme de formation en ligne intégrée (réf. Udemy, Coursera, TryHackMe).
- **Développeur** : Lembe, seul (maîtrise React, Django, PostgreSQL). Seul aussi à alimenter les cours au départ.

## 2. Règles de travail pour Claude Code
1. Travailler **une étape à la fois** (section 12). Ne pas anticiper les étapes suivantes.
2. Avant de coder une étape : résumer le plan en 5 lignes max, puis exécuter. Poser une question seulement si l'ambiguïté bloque réellement.
3. Petits commits Git, messages clairs en français (`feat:`, `fix:`, `chore:`).
4. **Aucun texte en dur** dans les composants : tout passe par les fichiers de traduction (FR/EN).
5. **Contenus provisoires** : les rédiger soi-même, cohérents avec le métier du cabinet (sécurité industrielle, HSE, environnement, qualité), les centraliser dans `content/` et les marquer `TODO-CONTENU`. Lembe les remplacera pas à pas.
6. Réponses et explications en **français**, pédagogiques. Modifications précises et localisées plutôt que réécritures complètes.
7. Mobile-first, léger (connexions parfois lentes) : images optimisées, chargement différé, pas de dépendance lourde inutile.
8. Écrire des tests pour la logique critique (auth, paiement, progression, certificats, permissions).
9. Ne jamais committer de secrets. Variables d'environnement via `.env` (fournir `.env.example`).
10. Utiliser exclusivement les icônes fines et cohérentes comme Lucide React ou Phosphor Icons, et remplacez les illustrations génériques par des schémas techniques vectoriels (SVG) ou des photographies authentiques de haute qualité.
11. Intégrer des composants issus de Magic UI ou d'Aceternity UI basés sur Tailwind CSS et Framer Motion. Privilégiez les grilles asymétriques (Bento Grids), les micro-interactions au survol et les révélations fluides au défilement plutôt que des animations lourdes.
12. Définir des design tokens (couleurs, espacements, rayons) dans Tailwind dès l'étape 0.
13. Utilise le dépot git https://github.com/hotchanghelohim04-sudo pour stocker le code et tout ce qui va concerner le site en créant un nouveau repository à l'intérieur

## 3. Identité visuelle
- Logo retenu : **« concept 8 »** (losange doré avec un K, typographie serif dorée sur fond noir). Fichiers (logo SVG, favicon, tampon) à placer par Lembe dans `frontend/public/brand/`. **Extraire la palette exacte du SVG** une fois les fichiers présents.
- Palette provisoire : noir profond `#0B0B0C`, or `#C9A227`, blanc cassé `#F7F5F0`, gris ardoise pour le texte secondaire. Respecter les contrastes (WCAG AA).
- Typographies provisoires : serif élégante pour les titres (Playfair Display ou Cormorant Garamond), sans-serif pour le corps (Inter).
- Ambiance : sobre, premium, autoritaire mais moderne (grandes sections, chiffres clés, animations discrètes). Sections sombres et claires en alternance pour la lisibilité.


## 4. Stack technique (décidée)
- **Front** : Next.js (App Router) + TypeScript + Tailwind CSS + `next-intl`. Raison : SEO, performance, i18n.
- **Back** : Django + Django REST Framework + PostgreSQL. Auth par sessions sécurisées ou JWT en cookie HttpOnly.
- **Tâches asynchrones** : Celery + Redis (e-mails, génération de certificats PDF, webhooks de paiement).
- **Admin** : tableau de bord dédié dans le front (section 8). L'admin Django reste un outil de secours.
- **Hébergement cible** : VPS (Hetzner ou OVH) avec Docker Compose + Caddy ou Nginx, Cloudflare devant (DNS, CDN, WAF). Aucun serveur ni domaine n'existe encore : fournir un `docker-compose.yml` utilisable en local puis en production. Pour un départ vu que tout est encore en développement, on pourrait utiliser un hébergeur gratuit puis quand tout sera okay on va passer à un vrai hébergeur
- **Monorepo** : `frontend/`, `backend/`, `content/`, `docs/`, `infra/`.

## 5. Langues
- **FR et EN natifs** (URLs `/fr`, `/en`, balises hreflang, SEO par langue).
- **Autres langues** : sélecteur de langue avec traduction automatique à la demande (API de traduction, résultats mis en cache). Prévoir l'architecture dès l'étape 0 ; implémentation à l'étape 7. Les contenus techniques et juridiques de référence restent FR/EN.
- Devise principale **XAF** ; affichage EUR/USD possible pour l'international.

## 6. Domaine et e-mails
- Domaine : `krool-holding.com` (à acheter).
- Adresses :
  - `contact@` — Direction / Consultant Senior
  - `solutions@` — Relations commerciales (contrats B2B/B2C)
  - `finance@` — Facturation et comptabilité
  - `support@` — Support de l'académie (étudiants, entreprises, professionnels, employés)
  - `no-reply@` — E-mails système automatisés
  - `credentials@` — Délivrance officielle des certificats 
- Boîtes pro : Zoho Mail ou Google Workspace. E-mails transactionnels : service dédié (Brevo ou Resend). Configurer SPF, DKIM, DMARC.

## 7. PHASE 1 — Site vitrine

### Pages
Accueil · Services (une page par service) · À propos / Équipe · Références et réalisations · Études de cas · Académie (présentation + catalogue public) · Blog / Actualités · Devis · Rendez-vous · Contact · FAQ · Mentions légales · Confidentialité · CGU/CGV.

### Accueil (structure)
Hero fort (promesse + 2 CTA : « Demander un devis », « Découvrir l'Académie ») · chiffres clés · services · secteurs servis · méthode de travail · références · aperçu Académie · témoignages · newsletter · pied de page complet.

### Actions des visiteurs (CTA)
1. **Demande de devis** : formulaire multi-étapes (service, secteur, taille du site, description, pièces jointes, coordonnées) → e-mail à `solutions@` + enregistrement en base.
2. **Prise de rendez-vous** : créneaux configurables par l'admin, confirmation par e-mail.
3. **Newsletter** : double opt-in.
4. **Inscription à la formation** : à partir de la Phase 2 ; en Phase 1, formulaire « être prévenu du lancement ».
5. **Contact** : formulaire avec anti-spam (honeypot + limitation de débit, sans CAPTCHA intrusif).

### Contenus provisoires
Rédiger des textes réalistes pour chaque service, un « À propos », 3 études de cas fictives marquées comme exemples, une équipe provisoire, une FAQ, 3 articles de blog. Tout marqué `TODO-CONTENU`.

### SEO / performance
Métadonnées par page et par langue, sitemap, robots, données structurées (Organization, Service), Open Graph, score Lighthouse ≥ 90.

## 8. Back-office administrateur (dès la Phase 1, étendu en Phase 2)
Page d'administration dédiée, protégée (2FA obligatoire), permettant la gestion **complète** du site et de la plateforme :
- **Site** : pages, services, équipe, références, études de cas, blog, FAQ, témoignages, médias, paramètres généraux, SEO.
- **Demandes** : devis, rendez-vous (créneaux), messages de contact, abonnés newsletter (export CSV).
- **Académie (CRUD complet)** : formations, modules, leçons (texte/vidéo), quiz, challenges, études de cas, situations-problèmes, mini-labs, examens finaux, parcours, badges, règles de points.
- **Tarification** : par formation, l'admin choisit **gratuit / payant / abonnement / mixte**, fixe prix et devise, crée des offres d'abonnement (particuliers, entreprises) et des codes promo.
- **Utilisateurs et organisations** : comptes, rôles, sièges B2B, suspension, réinitialisation.
- **Finance** : paiements, factures, abonnements, remboursements.
- **Certificats** : liste, révocation, réémission.
- **Journal d'audit** de toutes les actions administratives.
- Rôles : `super_admin` au départ ; prévoir `éditeur` et `formateur` pour plus tard.

## 9. PHASE 2 — Plateforme de formation

### Publics
Étudiants, professionnels, entreprises (comptes B2B avec gestionnaire, sièges, suivi d'équipe).

### Structure pédagogique
Formation → Modules → Leçons. Types de contenu : cours texte, vidéo, quiz, challenges, études de cas, situations-problèmes, **mini-labs légers** (simulations dans le navigateur : matrice de risques interactive, arbre des causes, inspection virtuelle d'un site avec dangers à repérer ; pas de machines virtuelles).

### Parcours d'un apprenant
Inscription → catalogue → (paiement si nécessaire) → modules dans l'ordre → validation de chaque module (seuil de réussite configurable) → **examen blanc final** débloqué quand tous les modules sont validés → **certificat** si réussite.

### Fonctionnalités
- Sauvegarde automatique de la progression et reprise là où l'on s'est arrêté.
- Points, badges, niveaux, classement optionnel.
- Tableau de bord apprenant (progression, badges, certificats, historique de paiements).
- **Certificats** : PDF généré avec identifiant unique + QR code, **page publique de vérification** (`/verifier/<code>`), envoi depuis `credentials@`.
- Quiz : QCM, vrai/faux, réponses multiples ; correction détaillée ; banque de questions avec tirage aléatoire pour l'examen.
- Niveaux : débutant / intermédiaire / avancé. Langue et durée indiquées par formation.
- Tableau de bord B2B : suivi des employés, export des résultats.

### Modules de lancement (provisoires, 5)
1. Fondamentaux des risques industriels
2. Études de dangers (identification, criticité, mesures de maîtrise)
3. Santé et sécurité au travail (SST)
4. Gestion de l'environnement et EIES
5. Qualité industrielle et amélioration continue

Contenu fictif cohérent à générer ; Lembe le remplacera depuis l'interface admin.

### Paiement
- **Mobile Money (MTN, Orange) et carte bancaire.**
- Passerelle à valider une fois la société immatriculée (candidats : Flutterwave, CinetPay, Campay, Notch Pay). Créer une **couche d'abstraction `PaymentProvider`** pour changer de prestataire sans refonte.
- Webhooks signés et idempotents ; un accès n'est débloqué qu'après confirmation serveur du paiement.
- Abonnements : renouvellement, expiration, relance par e-mail.

### Vidéo
Début : vidéos non listées (YouTube ou Vimeo) ; migration possible vers un hébergeur avec URL signées (ex. Bunny Stream). Isoler l'accès derrière une interface `VideoProvider`.

## 10. Modèle de données (à affiner)
`User`, `Organization`, `Membership`, `Formation`, `Module`, `Lesson`, `Quiz`, `Question`, `Challenge`, `CaseStudy`, `MiniLab`, `Exam`, `Enrollment`, `Progress`, `Attempt`, `Badge`, `PointsLedger`, `Certificate`, `Offer`, `Subscription`, `Payment`, `Invoice`, `PromoCode`, `QuoteRequest`, `Appointment`, `ContactMessage`, `NewsletterSubscriber`, `Page`, `Service`, `TeamMember`, `Reference`, `CaseStudyPublic`, `BlogPost`, `FAQ`, `Translation`, `AuditLog`.

## 11. Sécurité (priorité : le site représente un cabinet de sécurité)
- Cible : **OWASP ASVS niveau 2**, OWASP Top 10 couvert.
- Mots de passe Argon2, 2FA TOTP obligatoire pour l'admin et optionnelle pour les utilisateurs.
- Limitation de débit (connexion, formulaires, API), verrouillage progressif, protection brute force.
- CSRF, CORS strict, en-têtes de sécurité (CSP, HSTS, X-Content-Type-Options, Referrer-Policy), cookies `Secure` + `HttpOnly` + `SameSite`.
- Validation stricte côté serveur, requêtes paramétrées, échappement systématique, contrôle strict des uploads (type, taille, antivirus si possible).
- Autorisation vérifiée côté serveur sur chaque ressource (pas de confiance au front).
- Journal d'audit, sauvegardes chiffrées automatiques de la base, plan de restauration testé.
- Analyse des dépendances (`npm audit`, `pip-audit`, Dependabot) et secrets scannés en CI.
- Données personnelles : minimisation, consentement cookies, politique de confidentialité conforme au droit camerounais et au RGPD pour les visiteurs européens (**à faire valider par un juriste**).

## 12. Plan par étapes
- **Étape 0** — Initialisation : monorepo, Docker Compose, CI, design tokens, i18n FR/EN, structure de base.
- **Étape 1** — Site vitrine : toutes les pages publiques, contenus provisoires, formulaires (devis, RDV, newsletter, contact).
- **Étape 2** — Back-office : authentification admin + 2FA, gestion de contenu du site, gestion des demandes.
- *(Fin Phase 1 : mise en ligne de la vitrine)*
- **Étape 3** — Comptes utilisateurs, organisations B2B, catalogue public de formations.
- **Étape 4** — Moteur de formation : leçons, quiz, progression, CRUD admin des contenus pédagogiques.
- **Étape 5** — Points, badges, examen final, certificats avec vérification publique.
- **Étape 6** — Paiement (Mobile Money + carte), tarification gratuit/payant/abonnement, B2B.
- **Étape 7** — Traduction automatique multilingue, durcissement sécurité, tests de charge, déploiement production.

## 13. Points ouverts (à confirmer par Lembe) et avancement
**Ouverts** : budget et délai visés · hébergeur et domaine à acheter · fichiers du logo (SVG, favicon, tampon) · passerelle de paiement définitive · hébergement vidéo définitif · nom de la plateforme (provisoire : « Krool Academy ») · bio, photos et certifications de l'équipe · références réelles · liste définitive des modules de lancement · politique de prix (XAF) (propose)·

**Avancement** :
- **2026-11-13 — Étape 0 terminée (en local).** Monorepo, Next.js 16.4 (App Router, `cacheComponents`, `src/proxy.ts`) + Tailwind v4 (tokens dans `@theme`, `frontend/src/app/globals.css`, doc `docs/design-tokens.md`) + next-intl 4 (FR/EN via `next/root-params`, hreflang, architecture langues auto documentée dans `docs/architecture/i18n.md`). Django 5.2 + DRF + modèle `accounts.User` personnalisé + Argon2 + Celery/Redis + `/api/health/` + 5 tests. Docker Compose (local + profil `prod` avec Caddy), `.env.example`, CI GitHub Actions (lint, types, build, tests, pip-audit, npm audit, gitleaks), Dependabot.
- **2026-11-13 — Dépôt GitHub** : https://github.com/hotchanghelohim04-sudo/krool-holding (public), `main` poussée, CI verte (gitleaks via binaire, actions Node 24).
- **2026-11-13 — Identité visuelle intégrée** : logos SVG dans `frontend/public/brand/`, favicons dans `frontend/src/app/`, tampons dans `backend/assets/brand/` (jamais servis publiquement), exports PNG + SVG Figma dans `docs/brand/`. Palette exacte extraite du logo (or `#C9A24B`, noir `#0D0D0F`, or fond clair `#A8842F`/`#7A5F1F`, tampon `#1D3FA0`) → tokens et `docs/design-tokens.md` à jour. En-tête : emblème `logo-mark.svg` + nom.
- **2026-11-13 — Docker validé en CI** : job « Docker Compose » (build des images, démarrage de db/redis/backend/worker/frontend, healthchecks, test de `/api/health/` et `/fr`). Correctif : dossiers `staticfiles/` et `media/` attribués à l'utilisateur non root. Script local `infra/scripts/verifier-docker.ps1`.
- **En attente** : installation de Docker Desktop sur le poste de Lembe (images à placer sur F:, C: n'a que 13 Go libres ; RAM 7,7 Go → limiter WSL à ~3-4 Go), puis lancer le script de vérification locale.
- **Prochaine étape** : Étape 1 — site vitrine.
