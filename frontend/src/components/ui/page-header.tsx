import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Bandeau en tête des pages intérieures. Avec `image` : photo plein cadre sous un voile
 * noir dégradé (texte blanc toujours lisible), à la manière de bakerrisk.com.
 * La photo est l'élément principal de la page : chargée en priorité.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden bg-ink-950 text-paper">
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            quality={70}
            loading="eager"
            fetchPriority="high"
            className="-z-10 object-cover"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-black/90 via-black/70 to-black/35" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-black/60 to-transparent" />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--color-gold-500)_1px,transparent_1px),linear-gradient(90deg,var(--color-gold-500)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
      )}
      <div className={image ? "relative container-site py-20 sm:py-28 lg:py-36" : "relative container-site py-16 sm:py-20 lg:py-24"}>
        {eyebrow && <p className="text-xs font-semibold tracking-[0.2em] text-gold-500 uppercase">{eyebrow}</p>}
        <h1 className="mt-4 max-w-4xl text-4xl leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg text-slate-300 sm:text-xl">{lead}</p>}
        {children}
      </div>
    </header>
  );
}
