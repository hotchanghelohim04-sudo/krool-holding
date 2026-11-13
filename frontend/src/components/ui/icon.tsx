import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  Factory,
  FlaskConical,
  Fuel,
  Gauge,
  GraduationCap,
  HardHat,
  Landmark,
  Leaf,
  type LucideIcon,
  Pickaxe,
  Ruler,
  ScanSearch,
  ShieldCheck,
  Ship,
  TriangleAlert,
  Users,
  Wheat,
  Zap,
} from "lucide-react";

/**
 * Icônes référencées par leur nom dans content/*.json.
 * Import explicite (et non `import *`) : seules ces icônes sont embarquées.
 */
const ICONS: Record<string, LucideIcon> = {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  Factory,
  FlaskConical,
  Fuel,
  Gauge,
  GraduationCap,
  HardHat,
  Landmark,
  Leaf,
  Pickaxe,
  Ruler,
  ScanSearch,
  ShieldCheck,
  Ship,
  TriangleAlert,
  Users,
  Wheat,
  Zap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? ShieldCheck;
  return <Component aria-hidden className={className} strokeWidth={1.5} />;
}
