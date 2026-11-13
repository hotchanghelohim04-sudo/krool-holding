"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonStyles } from "@/components/ui/button";
import { usePathname } from "@/i18n/navigation";

import { NavLink } from "./nav-link";
import { MAIN_NAV, type ServiceNavItem } from "./nav-items";

/** Menu mobile en panneau plein écran (accessible : Échap, focus, aria-expanded). */
export function MobileMenu({ services }: { services: ServiceNavItem[] }) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Ferme le menu à chaque changement de page (y compris retour arrière du navigateur).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const linkClass =
    "block rounded-md px-3 py-3 text-lg text-paper transition-colors hover:bg-ink-800 aria-[current=page]:text-gold-400";

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-sm text-paper hover:bg-ink-800"
      >
        {open ? <X aria-hidden className="size-6" strokeWidth={1.5} /> : <Menu aria-hidden className="size-6" strokeWidth={1.5} />}
        <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-ink-800 bg-ink-950 px-4 pt-4 pb-10"
        >
          <nav aria-label={t("mainLabel")}>
            <ul className="space-y-1">
              <li>
                <NavLink href="/services" className={linkClass} onNavigate={close}>
                  {t("services")}
                </NavLink>
                <ul className="mb-2 ml-3 border-l border-ink-800 pl-3">
                  {services.map((service) => (
                    <li key={service.key}>
                      <NavLink
                        href={{ pathname: "/services/[slug]", params: { slug: service.slug } }}
                        className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:text-paper aria-[current=page]:text-gold-400"
                        onNavigate={close}
                      >
                        {service.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
              {MAIN_NAV.map((item) => (
                <li key={item.key}>
                  <NavLink href={item.pathname} className={linkClass} onNavigate={close}>
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
            {/* Sur petit écran, la bascule de thème est ici plutôt que dans l'en-tête. */}
            <ThemeToggle withLabel className="mt-4 sm:hidden" />
            <div className="mt-8 grid gap-3">
              <NavLink href="/devis" className={buttonStyles("primary", "lg")} onNavigate={close}>
                {t("quote")}
              </NavLink>
              <NavLink href="/rendez-vous" className={buttonStyles("outline", "lg")} onNavigate={close}>
                {t("appointment")}
              </NavLink>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
