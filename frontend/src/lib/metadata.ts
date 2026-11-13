import type { Metadata } from "next";
import type { NativeLocale } from "@/i18n/config";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { siteUrl } from "./site";

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * Métadonnées d'une page : titre, description, URL canonique, hreflang FR/EN
 * et Open Graph. `hrefs` donne l'URL de la page dans chaque langue (utile quand
 * le slug est traduit) ; sinon `href` est utilisé pour toutes les langues.
 */
export function pageMetadata({
  locale,
  title,
  description,
  href,
  hrefs,
  type = "website",
  noIndex = false,
}: {
  locale: NativeLocale;
  title?: string;
  description?: string;
  href?: Href;
  hrefs?: Record<NativeLocale, Href>;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const pathFor = (l: NativeLocale) => getPathname({ href: (hrefs?.[l] ?? href ?? "/") as Href, locale: l });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, pathFor(l)]));

  return {
    title,
    description,
    alternates: {
      canonical: pathFor(locale),
      languages: { ...languages, "x-default": pathFor(routing.defaultLocale) },
    },
    openGraph: {
      type,
      title,
      description,
      url: pathFor(locale),
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      // Redéfinir openGraph remplace celui du layout : on référence donc l'image de partage.
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: "Krool Holding" }],
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
