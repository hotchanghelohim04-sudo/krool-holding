"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

import { THEME_STORAGE_KEY } from "./theme-constants";


type Theme = "light" | "dark";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** Bascule clair / sombre. Le thème initial est posé avant l'affichage par ThemeScript. */
export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const t = useTranslations("Theme");
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Stockage indisponible (navigation privée) : le choix vaut pour la page en cours.
    }
  }

  const label = next === "dark" ? t("toDark") : t("toLight");
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={withLabel ? undefined : label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm text-slate-300 transition-colors hover:text-gold-400",
        withLabel ? "px-3 py-3 text-base" : "size-10",
        className,
      )}
    >
      <Icon aria-hidden className="size-5" strokeWidth={1.5} />
      {withLabel && <span>{label}</span>}
    </button>
  );
}
