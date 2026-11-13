# Design tokens

Source unique : `frontend/src/app/globals.css` (bloc `@theme`, Tailwind v4).
Chaque token devient une classe utilitaire : `--color-gold-500` → `text-gold-500`, `bg-gold-500`…

## Couleurs (extraites du logo « concept 8 »)

| Token | Valeur | Origine dans le logo | Usage |
| --- | --- | --- | --- |
| `ink-950` | `#0D0D0F` | Fond du favicon | Fond des sections sombres |
| `ink-900` | `#16161A` | — | Cartes sur fond sombre |
| `ink-800` | `#222228` | — | Bordures sur fond sombre |
| `gold-300` | `#D8BE80` | Signature « Industrial Safety & Advisory » | Texte doré clair sur sombre |
| `gold-400` | `#D4AF55` | K en petits H | Survols, accents |
| `gold-500` | `#C9A24B` | Losange, « KROOL » | Accent de marque **sur fond sombre** |
| `gold-600` | `#A8842F` | Logo version fond clair | Grands titres / décor sur clair |
| `gold-700` | `#7A5F1F` | Signature version fond clair | Texte doré **sur fond clair** |
| `seal` | `#1D3FA0` | Tampon bleu | Certificats, documents officiels |
| `paper` | `#F7F5F0` | — | Fond des sections claires |
| `slate-300` | `#A1A7B0` | — | Texte secondaire sur sombre |
| `slate-600` | `#55606E` | — | Texte secondaire sur clair |
| `success` / `warning` / `danger` / `info` | — | — | États, matrices de risques |

Contrastes (WCAG AA : texte ≥ 4.5:1, grand texte ≥ 3:1) : gold-500/noir 8.09 · gold-300/noir 10.72 ·
blanc cassé/noir 17.82 · slate-300/noir 8.02 · slate-600/blanc cassé 5.87 · gold-700/blanc cassé 5.53 ·
gold-600/blanc cassé 3.21 (grand texte seulement).
⚠ `gold-500` sur `paper` = 2.2:1 → interdit pour du texte (décoratif uniquement).

## Fichiers de marque

| Emplacement | Contenu |
| --- | --- |
| `frontend/public/brand/` | Logos SVG servis par le site (voir son README) |
| `frontend/src/app/` | `favicon.ico`, `icon.svg`, `apple-icon.png` (conventions Next.js) |
| `backend/assets/brand/` | Tampons (noir, bleu) pour les certificats PDF — **jamais servis publiquement** |
| `docs/brand/` | Exports PNG haute définition et SVG modifiable (Figma/Canva) pour l'impression et les réseaux |

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
