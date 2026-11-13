# Design tokens

Source unique : `frontend/src/app/globals.css` (bloc `@theme`, Tailwind v4).
Chaque token devient une classe utilitaire : `--color-gold-500` → `text-gold-500`, `bg-gold-500`…

## Couleurs (provisoires, à recaler sur le logo SVG)

| Token | Valeur | Usage |
| --- | --- | --- |
| `ink-950` | `#0B0B0C` | Fond des sections sombres |
| `ink-900` | `#16161A` | Cartes sur fond sombre |
| `ink-800` | `#222228` | Bordures sur fond sombre |
| `gold-500` | `#C9A227` | Accent de marque **sur fond sombre** |
| `gold-700` | `#7A5E0E` | Or pour du texte **sur fond clair** |
| `paper` | `#F7F5F0` | Fond des sections claires |
| `slate-300` | `#A1A7B0` | Texte secondaire sur sombre |
| `slate-600` | `#55606E` | Texte secondaire sur clair |
| `success` / `warning` / `danger` / `info` | — | États, matrices de risques |

Contrastes (WCAG AA ≥ 4.5:1) : or/noir 8.13 · blanc cassé/noir 18.06 · slate-300/noir 8.12 ·
slate-600/blanc cassé 5.87 · gold-700/blanc cassé 5.61.
⚠ `gold-500` sur `paper` = 2.2:1 → interdit pour du texte (décoratif uniquement).

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
