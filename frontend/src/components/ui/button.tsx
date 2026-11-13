import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "outline-dark" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-soft focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Or plein : texte noir sur or (contraste 8:1).
  primary: "bg-gold-500 text-ink-950 hover:bg-gold-400 hover:shadow-glow-gold active:translate-y-px",
  // Contour or sur fond sombre.
  outline: "border border-gold-500/60 text-gold-300 hover:border-gold-400 hover:bg-gold-500/10",
  // Contour sur fond clair.
  "outline-dark": "border border-ink-950/20 text-ink-950 hover:border-gold-600 hover:text-gold-700",
  ghost: "text-gold-700 underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles(variant, size, className)} {...props} />;
}
