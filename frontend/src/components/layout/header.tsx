import { ChevronDown } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { KroolMark } from "@/components/brand/krool-logo";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { NativeLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/lib/content";

import { LocaleSwitcher } from "./locale-switcher";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";
import { MAIN_NAV, type ServiceNavItem } from "./nav-items";

const linkClass =
  "rounded-sm px-3 py-2 text-sm text-slate-300 transition-colors hover:text-paper aria-[current=page]:text-gold-400";

export async function Header() {
  const locale = (await getLocale()) as NativeLocale;
  const t = await getTranslations("Header");
  const tNav = await getTranslations("Nav");
  const tBrand = await getTranslations("Brand");
  const services: ServiceNavItem[] = (await getServices()).map((s) => ({
    key: s.key,
    slug: s[locale].slug,
    title: s[locale].title,
    short: s[locale].short,
    icon: s.icon,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950 text-paper">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink-950"
      >
        {t("skipToContent")}
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          {/* Déclinaison horizontale du logo v2 : emblème + KROOL / HOLDING. Le texte visible
              ouvre le nom accessible du lien (commande vocale « cliquer Krool Holding »). */}
          <KroolMark className="size-11 transition-transform duration-300 ease-out-soft group-hover:scale-105" />
          <span className="flex flex-col leading-none whitespace-nowrap">
            <span className="text-base font-medium tracking-[0.34em] text-logo-gold sm:text-lg">{tBrand("name")}</span>{" "}
            <span className="mt-1.5 text-[0.625rem] tracking-[0.5em] text-paper">{tBrand("suffix")}</span>
            <span className="sr-only">, {t("homeLink")}</span>
          </span>
        </Link>

        {/* Navigation ordinateur */}
        <nav aria-label={tNav("mainLabel")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            <li className="group relative">
              <NavLink href="/services" className={`${linkClass} inline-flex items-center gap-1`}>
                {tNav("services")}
                <ChevronDown
                  aria-hidden
                  className="size-3.5 transition-transform group-focus-within:rotate-180 group-hover:rotate-180"
                  strokeWidth={1.5}
                />
              </NavLink>
              {/* Menu déroulant : visible au survol ET au focus clavier (sans JavaScript) */}
              <div className="invisible absolute top-full left-1/2 w-[40rem] -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="grid grid-cols-2 gap-1 rounded-lg border border-ink-800 bg-ink-900 p-3 shadow-2xl">
                  {services.map((service) => (
                    <li key={service.key}>
                      <Link
                        href={{ pathname: "/services/[slug]", params: { slug: service.slug } }}
                        className="flex gap-3 rounded-md p-3 transition-colors hover:bg-ink-800 focus-visible:bg-ink-800"
                      >
                        <Icon name={service.icon} className="mt-0.5 size-5 shrink-0 text-gold-400" />
                        <span>
                          <span className="block text-sm font-medium text-paper">{service.title}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-slate-300">
                            {service.short}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            {MAIN_NAV.map((item) => (
              <li key={item.key}>
                <NavLink href={item.pathname} className={linkClass}>
                  {tNav(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          <ButtonLink href="/devis" className="hidden lg:inline-flex">
            {tNav("quote")}
          </ButtonLink>
          <MobileMenu services={services} />
        </div>
      </div>
    </header>
  );
}
