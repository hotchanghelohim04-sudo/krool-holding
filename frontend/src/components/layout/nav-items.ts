import type { StaticPathname } from "@/i18n/routing";

/** Entrées de la navigation principale (libellés dans messages/*.json → Nav). */
export const MAIN_NAV: { key: string; pathname: StaticPathname }[] = [
  { key: "caseStudies", pathname: "/etudes-de-cas" },
  { key: "academy", pathname: "/academie" },
  { key: "about", pathname: "/a-propos" },
  { key: "news", pathname: "/actualites" },
  { key: "contact", pathname: "/contact" },
];

export interface ServiceNavItem {
  key: string;
  slug: string;
  title: string;
  short: string;
  icon: string;
}
