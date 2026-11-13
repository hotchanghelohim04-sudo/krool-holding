import { defineRouting } from "next-intl/routing";

import { defaultLocale, nativeLocales } from "./config";

/**
 * Routage FR/EN avec URLs traduites (SEO par langue).
 * Clé = dossier interne dans src/app/[locale]/ ; valeur = URL publique par langue.
 * Les fiches (services, études de cas, articles) ont en plus un slug traduit,
 * défini dans content/.
 */
export const routing = defineRouting({
  locales: nativeLocales,
  defaultLocale,
  // Toujours préfixer (/fr, /en) : URLs explicites et hreflang propres.
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/services": "/services",
    "/services/[slug]": "/services/[slug]",
    "/etudes-de-cas": { fr: "/etudes-de-cas", en: "/case-studies" },
    "/etudes-de-cas/[slug]": { fr: "/etudes-de-cas/[slug]", en: "/case-studies/[slug]" },
    "/references": "/references",
    "/a-propos": { fr: "/a-propos", en: "/about" },
    "/academie": { fr: "/academie", en: "/academy" },
    "/actualites": { fr: "/actualites", en: "/news" },
    "/actualites/[slug]": { fr: "/actualites/[slug]", en: "/news/[slug]" },
    "/devis": { fr: "/devis", en: "/quote" },
    "/rendez-vous": { fr: "/rendez-vous", en: "/appointment" },
    "/contact": "/contact",
    "/faq": "/faq",
    "/mentions-legales": { fr: "/mentions-legales", en: "/legal-notice" },
    "/confidentialite": { fr: "/confidentialite", en: "/privacy" },
    "/conditions": { fr: "/conditions-generales", en: "/terms" },
    "/newsletter/confirmation": "/newsletter/confirmation",
  },
});

export type AppPathname = keyof typeof routing.pathnames;
/** Pages sans paramètre dynamique (utilisables directement comme lien). */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;
