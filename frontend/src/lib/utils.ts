import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind sans conflit (convention Magic UI / Aceternity). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
