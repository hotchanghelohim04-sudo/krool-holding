import { getTranslations } from "next-intl/server";
import Image from "next/image";

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
        <Link href="/" aria-label={t("homeLink")} className="group flex items-center gap-3">
          {/* Emblème du logo « concept 8 » (losange + K) ; décoratif, le lien porte le libellé. */}
          <Image
            src="/brand/logo-mark.svg"
            alt=""
            width={36}
            height={36}
            unoptimized
            className="size-9 transition-transform duration-300 ease-out-soft group-hover:scale-105"
          />
          <span className="font-serif text-sm tracking-[0.12em] whitespace-nowrap text-gold-500 uppercase sm:text-lg sm:tracking-[0.18em]">
            {t("brandName")}
          </span>
        </Link>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
