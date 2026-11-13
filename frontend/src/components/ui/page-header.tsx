import type { ReactNode } from "react";

/** Bandeau sombre en tête des pages intérieures. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden bg-ink-950 text-paper">
      {/* Trame technique discrète en fond */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--color-gold-500)_1px,transparent_1px),linear-gradient(90deg,var(--color-gold-500)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="relative container-site py-16 sm:py-20 lg:py-24">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-4 max-w-4xl text-4xl leading-tight sm:text-5xl">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg text-slate-300">{lead}</p>}
        {children}
      </div>
    </header>
  );
}
