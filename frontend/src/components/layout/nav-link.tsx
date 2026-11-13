"use client";

import type { ComponentProps } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Href = ComponentProps<typeof Link>["href"];

/** Lien de navigation qui signale la page courante (aria-current + style). */
export function NavLink({
  href,
  className,
  activeClassName,
  children,
  onNavigate,
}: {
  href: Href;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const target = typeof href === "string" ? href : href.pathname;
  const active = target === "/" ? pathname === "/" : pathname === target || pathname.startsWith(`${target}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(className, active && activeClassName)}
      onClick={onNavigate}
    >
      {children}
    </Link>
  );
}
