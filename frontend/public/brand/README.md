# Identité visuelle — logo « concept 8 »

Fichiers servis publiquement par le site (`/brand/...`). Palette et contrastes : `docs/design-tokens.md`.

| Fichier | Contenu | Usage |
| --- | --- | --- |
| `logo-full-on-dark.svg` | Logo complet (losange, K en petits H, KROOL, HOLDING blanc, signature) | Hero, pied de page, sections sombres |
| `logo-full-on-light.svg` | Même logo, couleurs pour fond clair (HOLDING noir) | Sections claires, documents |
| `logo-compact-on-dark.svg` | Version simplifiée (K plein, KROOL HOLDING) | Petites tailles sur fond sombre |
| `logo-compact-on-light.svg` | Version simplifiée pour fond clair | Petites tailles sur fond clair |
| `logo-mark.svg` | Losange + K seul, fond transparent (dérivé du favicon) | En-tête du site |
| `favicon.svg` | Losange + K sur fond noir arrondi | Référence ; les favicons actifs sont dans `src/app/` |
| `icon-512.png` | Icône 512 px | Manifeste PWA / réseaux sociaux |

Règles :
- Les tampons officiels ne sont **pas** ici (risque de falsification) : voir `backend/assets/brand/`.
- Ne pas modifier les couleurs des SVG à la main : partir des fichiers de `docs/brand/`.
- Toujours fournir un texte alternatif (`alt`) traduit lorsque le logo porte du sens.
