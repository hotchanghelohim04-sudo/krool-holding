/**
 * Grille asymétrique — adaptée de Magic UI « Bento Grid » (licence MIT).
 * Changements : tokens Krool, icônes Lucide, lien interne traduit, carte entière
 * cliquable, photo en fond (zoom léger au survol), micro-interactions en CSS uniquement.
 */
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid auto-rows-[minmax(18rem,auto)] grid-cols-1 gap-4 md:grid-cols-6", className)}>
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
  image,
  sizes = "(min-width: 768px) 50vw, 100vw",
}: {
  title: string;
  description: string;
  icon: ReactNode;
  href: ComponentProps<typeof Link>["href"];
  cta: string;
  className?: string;
  image?: string;
  sizes?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate flex flex-col justify-end overflow-hidden rounded-lg border border-ink-800 bg-ink-900 p-6 text-paper transition-[border-color,box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-glow-gold",
        className,
      )}
    >
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            sizes={sizes}
            quality={65}
            className="-z-10 object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/70 to-black/15" />
        </>
      )}
      <span className="inline-flex size-11 items-center justify-center self-start rounded-md border border-gold-500/40 bg-black/60 text-gold-400 backdrop-blur-sm transition-colors duration-300 group-hover:border-gold-400 group-hover:text-gold-300">
        {icon}
      </span>
      <h3 className="mt-4 text-xl sm:text-2xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">{description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400">
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
