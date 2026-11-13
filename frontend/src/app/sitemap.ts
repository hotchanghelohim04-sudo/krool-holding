import type { MetadataRoute } from "next";

import type { NativeLocale } from "@/i18n/config";
import { getPathname } from "@/i18n/navigation";
import { routing, type StaticPathname } from "@/i18n/routing";
import { getArticles, getCaseStudies, getServices } from "@/lib/content";
import { absoluteUrl } from "@/lib/metadata";

type Href = Parameters<typeof getPathname>[0]["href"];

// Pages statiques à indexer (la confirmation newsletter est volontairement exclue).
const STATIC_PAGES: { pathname: StaticPathname; priority: number }[] = [
  { pathname: "/", priority: 1 },
  { pathname: "/services", priority: 0.9 },
  { pathname: "/devis", priority: 0.9 },
  { pathname: "/etudes-de-cas", priority: 0.7 },
  { pathname: "/references", priority: 0.6 },
  { pathname: "/a-propos", priority: 0.7 },
  { pathname: "/academie", priority: 0.8 },
  { pathname: "/actualites", priority: 0.6 },
  { pathname: "/rendez-vous", priority: 0.7 },
  { pathname: "/contact", priority: 0.7 },
  { pathname: "/faq", priority: 0.5 },
  { pathname: "/mentions-legales", priority: 0.2 },
  { pathname: "/confidentialite", priority: 0.2 },
  { pathname: "/conditions", priority: 0.2 },
];

/** Une entrée par langue, chacune annonçant ses équivalents (hreflang). */
function entries(hrefs: Record<NativeLocale, Href>, priority: number, lastModified?: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(getPathname({ href: hrefs[l], locale: l }))]),
  );
  return routing.locales.map((locale) => ({
    url: languages[locale],
    priority,
    lastModified,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, studies, articles] = await Promise.all([getServices(), getCaseStudies(), getArticles()]);
  const both = (href: Href) => ({ fr: href, en: href });

  return [
    ...STATIC_PAGES.flatMap((page) => entries(both(page.pathname), page.priority)),
    ...services.flatMap((s) =>
      entries(
        {
          fr: { pathname: "/services/[slug]", params: { slug: s.fr.slug } },
          en: { pathname: "/services/[slug]", params: { slug: s.en.slug } },
        },
        0.8,
      ),
    ),
    ...studies.flatMap((s) =>
      entries(
        {
          fr: { pathname: "/etudes-de-cas/[slug]", params: { slug: s.fr.slug } },
          en: { pathname: "/etudes-de-cas/[slug]", params: { slug: s.en.slug } },
        },
        0.6,
      ),
    ),
    ...articles.flatMap((a) =>
      entries(
        {
          fr: { pathname: "/actualites/[slug]", params: { slug: a.fr.slug } },
          en: { pathname: "/actualites/[slug]", params: { slug: a.en.slug } },
        },
        0.5,
        a.date,
      ),
    ),
  ];
}
