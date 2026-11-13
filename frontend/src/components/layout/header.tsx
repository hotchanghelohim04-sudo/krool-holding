import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function Header() {
  const t = await getTranslations("Header");

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/95 text-paper backdrop-blur">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink-950"
      >
        {t("skipToContent")}
      </a>
      <div className="container-site flex h-16 items-center justify-between">
        {/* TODO-LOGO : remplacer par le SVG « concept 8 » de public/brand/ */}
        <Link href="/" aria-label={t("homeLink")} className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-8 rotate-45 place-items-center border border-gold-500"
          >
            <span className="-rotate-45 font-serif text-sm text-gold-500">K</span>
          </span>
          <span className="font-serif text-lg tracking-wide text-gold-500">{t("brandName")}</span>
        </Link>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
