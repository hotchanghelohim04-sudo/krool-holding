import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "dark" | "light" | "white";

const tones: Record<Tone, string> = {
  dark: "bg-ink-950 text-paper",
  light: "bg-paper text-ink-950",
  white: "bg-white text-ink-950",
};

/** Section pleine largeur : alternance sombre / clair (CLAUDE.md §3). */
export function Section({
  tone = "light",
  className,
  children,
  id,
  labelledBy,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("section-y", tones[tone], className)}>
      <div className="container-site">{children}</div>
    </section>
  );
}

/** Titre de section : sur-titre, titre, chapeau. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "left",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  tone?: Tone;
  align?: "left" | "center";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "text-xs font-semibold tracking-[0.2em] uppercase",
            dark ? "text-gold-500" : "text-gold-700",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="mt-3 text-3xl leading-tight sm:text-4xl">
        {title}
      </h2>
      {lead && (
        <p className={cn("mt-4 text-lg", dark ? "text-slate-300" : "text-slate-600")}>{lead}</p>
      )}
    </div>
  );
}
