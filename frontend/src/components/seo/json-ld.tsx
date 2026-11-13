/**
 * Données structurées schema.org (SEO). Le JSON est échappé : un « < » dans un
 * contenu ne peut pas fermer la balise <script> (protection contre l'injection).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
