/**
 * Grille asymétrique — adaptée de Magic UI « Bento Grid » (licence MIT).
 * Changements : tokens Krool, icônes Lucide, lien interne traduit, carte entière
 * cliquable, micro-interactions au survol en CSS uniquement.
 */
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-4 md:grid-cols-6", className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  icon,
  href,
  cta,
  className,
  background,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  href: ComponentProps<typeof Link>["href"];
  cta: string;
  className?: string;
  background?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-ink-800 bg-ink-900 p-6 text-paper transition-[border-color,transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-gold-500/50 hover:shadow-glow-gold",
        className,
      )}
    >
      {background && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {background}
        </div>
      )}
      <div className="relative">
        <span className="inline-flex size-11 items-center justify-center rounded-md border border-gold-500/30 bg-ink-950 text-gold-400 transition-colors duration-300 group-hover:border-gold-400 group-hover:text-gold-300">
          {icon}
        </span>
        <h3 className="mt-5 text-xl">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">{description}</p>
      </div>
      <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400">
        {cta}
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.5}
        />
      </span>
    </Link>
  );
}
