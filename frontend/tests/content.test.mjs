/**
 * Cohérence des contenus (content/) et des traductions (messages/).
 * Lancement : npm test  (lanceur de tests intégré à Node, aucune dépendance)
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const contentDir = path.join(root, "content");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(path.join(dir, entry.name))
      : entry.name.endsWith(".json")
        ? [path.join(dir, entry.name)]
        : [],
  );

/** Liste « chemin → type » de toutes les clés d'un objet (structure, pas valeurs). */
function shape(value, prefix = "") {
  if (Array.isArray(value)) return [`${prefix}[]`];
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .flatMap((key) => shape(value[key], prefix ? `${prefix}.${key}` : key));
  }
  return [`${prefix}:${typeof value}`];
}

const contentFiles = walk(contentDir);

test("tous les fichiers de content/ sont du JSON valide et marqués TODO-CONTENU", () => {
  assert.ok(contentFiles.length > 0);
  for (const file of contentFiles) {
    const data = readJson(file);
    assert.match(String(data.$todo ?? ""), /TODO-CONTENU/, `${file} : clé $todo manquante`);
  }
});

test("chaque contenu a les mêmes champs en FR et en EN", () => {
  for (const file of contentFiles) {
    const data = readJson(file);
    if (data.fr && data.en) {
      if (Array.isArray(data.fr)) {
        assert.equal(data.fr.length, data.en.length, `${file} : nombre d'éléments FR/EN différent`);
      } else {
        assert.deepEqual(shape(data.fr), shape(data.en), `${file} : champs FR/EN différents`);
      }
    }
  }
});

test("les slugs sont uniques dans chaque langue", () => {
  for (const folder of ["services", "case-studies", "blog"]) {
    const items = walk(path.join(contentDir, folder)).map(readJson);
    for (const locale of ["fr", "en"]) {
      const slugs = items.map((item) => item[locale].slug);
      assert.equal(new Set(slugs).size, slugs.length, `${folder} : slug ${locale} en double`);
      for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `slug invalide : ${slug}`);
    }
  }
});

test("les codes de services et de secteurs sont acceptés par l'API Django", () => {
  const choices = readFileSync(path.join(root, "backend", "apps", "leads", "choices.py"), "utf8");
  const block = (name) => choices.split(`class ${name}(`)[1].split("\nclass ")[0];
  const codes = (name) => new Set([...block(name).matchAll(/=\s*"([a-z-]+)",/g)].map((m) => m[1]));

  const services = codes("Service");
  for (const item of walk(path.join(contentDir, "services")).map(readJson)) {
    assert.ok(services.has(item.key), `service « ${item.key} » inconnu du backend`);
  }
  const sectors = codes("Sector");
  for (const sector of readJson(path.join(contentDir, "site.json")).sectors) {
    assert.ok(sectors.has(sector.key), `secteur « ${sector.key} » inconnu du backend`);
  }
});

test("les traductions de l'interface ont les mêmes clés en FR et en EN", () => {
  const fr = readJson(path.join(here, "..", "messages", "fr.json"));
  const en = readJson(path.join(here, "..", "messages", "en.json"));
  assert.deepEqual(shape(fr), shape(en));
});
