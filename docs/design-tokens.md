# Design tokens

Source unique : `frontend/src/app/globals.css` (bloc `@theme`, Tailwind v4).
Chaque token devient une classe utilitaire : `--color-gold-500` → `text-gold-500`, `bg-gold-500`…

## Couleurs (or aligné sur le logo v2, #F2A906)

| Token | Valeur | Origine dans le logo | Usage |
| --- | --- | --- | --- |
| `ink-950` | `#000000` | Vrai noir (comme bakerrisk.com) | Hero, en-tête, pied de page, bandes noires |
| `ink-900` | `#16161A` | — | Cartes sur fond sombre |
| `ink-800` | `#222228` | — | Bordures sur fond sombre |
| `gold-300` | `#F8CA62` | Gamme du logo v2 | Texte doré clair sur sombre |
| `gold-400` | `#F6B628` | Gamme du logo v2 | Survols, accents |
| `gold-500` | `#F2A906` | Or du logo v2 | Accent de marque **sur fond sombre**, boutons (texte noir) |
| `gold-600` | `#B37D05` | Gamme du logo v2 | Grands titres / décor sur clair |
| `gold-700` | `#8A5F00` | Gamme du logo v2 | Texte doré **sur fond clair** |
| `seal` | `#1D3FA0` | Tampon bleu | Certificats, documents officiels |
| `logo-gold` | `#F2A906` | Logo v2 (13/11/2026) | **Logo uniquement**, figé (emblème, KROOL, signature) |
| `logo-line` | `#CAA24B` | Filet du logo v2 | **Logo uniquement**, figé |
| `paper` | `#F7F5F0` | — | Fond des sections claires |
| `slate-300` | `#A1A7B0` | — | Texte secondaire sur sombre |
| `slate-600` | `#55606E` | — | Texte secondaire sur clair |
| `success` / `warning` / `danger` / `info` | — | — | États, matrices de risques |

Contrastes (WCAG AA : texte ≥ 4.5:1, grand texte ≥ 3:1) : gold-500/noir 9.66 · noir sur gold-500 9.66 ·
gold-300/noir 12.59 · blanc cassé/noir 17.82 · slate-300/noir 8.02 · slate-600/blanc cassé 5.87 ·
gold-700/blanc cassé 5.18 · gold-600/blanc cassé 3.29 (grand texte seulement).
⚠ `gold-300/400/500` sur `paper` (1.4 à 1.8:1) → interdits pour du texte sur fond clair.
Vérification : audit d'accessibilité Lighthouse à 100 sur les pages principales (13/11/2026).

## Fichiers de marque

| Emplacement | Contenu |
| --- | --- |
| `frontend/public/brand/` | Logos SVG servis par le site (voir son README) |
| `frontend/src/app/` | `favicon.ico`, `icon.svg`, `apple-icon.png` (conventions Next.js) |
| `backend/assets/brand/` | Tampons (noir, bleu) pour les certificats PDF — **jamais servis publiquement** |
| `docs/brand/` | Exports PNG haute définition et SVG modifiable (Figma/Canva) pour l'impression et les réseaux |
| `frontend/src/components/brand/krool-logo.tsx` | **Logo v2 en SVG intégré** (en-tête : emblème + KROOL/HOLDING ; pied de page : logo complet). Référence : `docs/brand/logo-v2-reference.png` |

## Thèmes clair et sombre

Bouton soleil/lune dans l'en-tête (dans le menu sur mobile). Thème initial : choix mémorisé
du visiteur, sinon préférence du système ; posé avant l'affichage (`components/theme/theme-script.tsx`).

| Token sémantique | Clair | Sombre | Usage |
| --- | --- | --- | --- |
| `surface` | `#FFFFFF` | `#000000` | Fond des sections thémables |
| `surface-alt` | `#F2F2F2` | `#0D0D0F` | Bandes alternées (section `tone="alt"`) |
| `surface-raised` | `#FFFFFF` | `#141416` | Cartes, champs de formulaire |
| `fg` / `fg-muted` | `#0A0903` / `#5C5C5C` | `#F5F5F5` / `#A1A7B0` | Texte / texte secondaire |
| `accent` | `#8A5F00` (gold-700) | `#F6B628` (gold-400) | Texte doré |
| `danger-fg` / `success-fg` / `warning-fg` | sombres | clairs | Messages d'état |

Règle : sections thémables → tokens sémantiques (`bg-surface`, `text-fg`…) ; sections toujours
sombres → tokens `ink-*` / `text-paper`. Texte sur fond or : toujours `text-black`.

## Typographies

- Titres : `font-serif` → Playfair Display (provisoire, alternative : Cormorant Garamond).
- Texte : `font-sans` → Inter.
Chargées par `next/font` (auto-hébergées, `display: swap`, aucune requête vers Google côté visiteur).

## Espacements et mise en page

- `container-site` : largeur max 80rem + gouttières (1rem mobile, 2rem desktop).
- `section-y` : rythme vertical des sections (5rem mobile, 8rem desktop).
- `max-w-prose` : 42rem, largeur de lecture.

## Rayons

`xs` 2px · `sm` 4px · `md` 8px · `lg` 12px · `xl` 16px · `2xl` 24px.
Style cabinet : privilégier `sm`/`md` ; réserver `xl`/`2xl` aux cartes Bento.

## Mouvement

`animate-fade-up` (0.6 s, `ease-out-soft`). `prefers-reduced-motion` est respecté globalement.
