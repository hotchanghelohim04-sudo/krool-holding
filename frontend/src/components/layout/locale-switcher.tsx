"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Href = ComponentProps<typeof Link>["href"];

/**
 * Sélecteur des langues natives (FR/EN). Conserve la page courante, y compris
 * ses paramètres : sur une fiche, le slug est ensuite traduit par la page
 * elle-même (redirection vers le slug de l'autre langue).
 * Les langues en traduction automatique s'y ajouteront à l'étape 7.
 */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const current = useLocale();
  const pathname = usePathname();
  // Paramètres de la page (ex. slug) sans le segment de langue.
  const params = Object.fromEntries(
    Object.entries(useParams<Record<string, string>>()).filter(([key]) => key !== "locale"),
  );
  const href = (Object.keys(params).length ? { pathname, params } : pathname) as Href;

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1.5 text-sm">
      <Languages aria-hidden className="hidden size-4 text-slate-300 sm:block" strokeWidth={1.5} />
      <ul className="flex gap-0.5">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={href}
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-current={locale === current ? "true" : undefined}
              title={t(locale)}
              className={cn(
                "rounded-sm px-2 py-1 uppercase transition-colors",
                locale === current ? "text-gold-500" : "text-slate-300 hover:text-paper",
              )}
            >
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
