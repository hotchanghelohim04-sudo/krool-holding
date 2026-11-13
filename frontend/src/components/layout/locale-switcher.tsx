"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Sélecteur des langues natives (FR/EN).
 * Les langues en traduction automatique s'y ajouteront à l'étape 7.
 */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-2 text-sm">
      <Languages aria-hidden className="size-4 text-slate-300" strokeWidth={1.5} />
      <ul className="flex gap-1">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
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
