"use client";

/**
 * Compteur animé — adapté de Magic UI « Number Ticker » (licence MIT).
 * Changements : formatage selon la langue, respect de prefers-reduced-motion,
 * valeur finale rendue côté serveur (lisible sans JavaScript et par les robots).
 */
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export function NumberTicker({
  value,
  locale,
  className,
}: {
  value: number;
  locale: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "0px" });
  // Le ressort peut passer légèrement sous 0 au départ : sans borne, on afficherait « -0 ».
  const format = (n: number) => new Intl.NumberFormat(locale).format(Math.max(0, Math.round(n)));

  useEffect(() => {
    if (isInView && !reduceMotion) {
      if (ref.current) ref.current.textContent = format(0);
      motionValue.set(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format ne dépend que de locale
  }, [isInView, reduceMotion, value, motionValue]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [springValue, locale],
  );

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {format(value)}
    </span>
  );
}
