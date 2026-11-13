# Contenus éditoriaux

Ce dossier centralise les **contenus provisoires** du site et de l'Académie. Le site
les lit au moment du rendu (`frontend/src/lib/content.ts`) : modifier un fichier ici
suffit, aucun composant n'est à toucher. Ils migreront vers la base de données avec
le back-office (étape 2).

- Chaque fichier contient une clé `$todo` marquée `TODO-CONTENU` : supprimez-la
  une fois le texte définitif validé.
- Chaque contenu existe en `fr` et en `en`, **avec les mêmes champs** (vérifié par
  les tests du front).
- Les **libellés d'interface** (boutons, menus, messages) ne sont pas ici : ils sont
  dans `frontend/messages/{fr,en}.json`.
- Les textes longs (articles, pages légales) sont écrits en blocs :
  `{ "type": "h2" | "p", "text": "…" }` ou `{ "type": "ul", "items": ["…"] }`.
  Aucun HTML n'est interprété (protection contre l'injection de code).

| Fichier / dossier | Contenu |
| --- | --- |
| `site.json` | Coordonnées, chiffres clés, secteurs, méthode, témoignages, références |
| `about.json` | Présentation du cabinet, mission, histoire, valeurs |
| `team.json` | Équipe (provisoire et fictive) |
| `services/*.json` | Une fiche par service ; `key` = code partagé avec l'API Django |
| `case-studies/*.json` | 3 études de cas **fictives** (`isExample: true` → badge « Exemple ») |
| `blog/*.json` | Articles d'actualité |
| `faq.json` | Questions fréquentes |
| `academy.json` | Présentation et catalogue public de Krool Academy |
| `legal/*.json` | Mentions légales, confidentialité, CGU/CGV (**à faire valider par un juriste**) |

Les `slug` (fin d'URL) sont propres à chaque langue : `/fr/services/etudes-de-dangers`
et `/en/services/hazard-studies`. Changer un slug change l'URL publique de la page.
