/**
 * Défilement continu — adapté de Magic UI « Marquee » (licence MIT).
 * 100 % CSS (aucun JavaScript). Les copies dupliquées sont masquées aux lecteurs
 * d'écran : le contenu n'est annoncé qu'une fois.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Marquee({
  children,
  className,
  reverse = false,
  repeat = 2,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  repeat?: number;
}) {
  return (
    <div
      className={cn(
        "group flex gap-(--gap) overflow-hidden [--duration:50s] [--gap:1rem] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "flex shrink-0 animate-marquee justify-around gap-(--gap) group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
