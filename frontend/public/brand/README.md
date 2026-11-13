# Identité visuelle — logo v2 (13/11/2026)

Fichiers servis publiquement par le site (`/brand/...`). Palette et contrastes : `docs/design-tokens.md`.
Image de référence du logo v2 : `docs/brand/logo-v2-reference.png`.

**Logo affiché sur le site** : composant SVG `src/components/brand/krool-logo.tsx`
(en-tête : emblème + KROOL / HOLDING ; pied de page : logo complet), pas un fichier de ce dossier.

| Fichier | Version | Contenu | Usage |
| --- | --- | --- | --- |
| `logo-mark.svg` | **v2** | Losange double + K en petits « H », or `#F2A906`, fond transparent | Image de partage (Open Graph) |
| `favicon.svg` | **v2** | Losange + K plein sur fond noir arrondi, or `#F2A906` | Référence ; favicons actifs dans `src/app/` |
| `icon-512.png` | **v2** | Icône 512 px (rendu de `favicon.svg`) | Données structurées, réseaux sociaux |
| `logo-full-on-dark.svg` | v1 (archive) | Ancien logo complet, or `#C9A24B`, typographie serif | Non utilisé |
| `logo-full-on-light.svg` | v1 (archive) | Idem pour fond clair | Non utilisé |
| `logo-compact-on-dark.svg` | v1 (archive) | Ancienne version simplifiée (K plein) | Non utilisé |
| `logo-compact-on-light.svg` | v1 (archive) | Idem pour fond clair | Non utilisé |

Favicons actifs (`src/app/`) : `icon.svg`, `favicon.ico` (16, 32, 48 px), `apple-icon.png` (180 px),
générés à partir de `favicon.svg` v2. Aux très petites tailles, le K plein reste lisible là où
le K en petits « H » deviendrait une simple texture.

Règles :
- Les tampons officiels ne sont **pas** ici (risque de falsification) : voir `backend/assets/brand/`.
- Les couleurs du logo sont figées (`logo-gold`, `logo-line`) : ne pas les dériver de la palette du site.
- Toujours fournir un texte alternatif (`alt`) traduit lorsque le logo porte du sens.
