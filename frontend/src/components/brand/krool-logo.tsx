/**
 * Logo Krool Holding (version 2, fournie le 13/11/2026 — référence : docs/brand/logo-v2-reference.png).
 *
 * Reconstruit en SVG intégré (et non en image) : net à toutes les tailles, sans requête,
 * et le texte utilise la vraie police du site (Inter). Les coordonnées reprennent celles de
 * l'image d'origine (en pixels) ; chaque texte est contraint à sa largeur mesurée
 * (textLength) pour garder la mise en page exacte.
 *
 * - tone="light" : version d'origine (HOLDING en noir), pour fonds clairs.
 * - tone="dark"  : HOLDING en blanc, pour fonds sombres (en-tête, pied de page).
 */
import { cn } from "@/lib/utils";

/** K dessiné en petits « H » (tracé repris du logo d'origine, repère 380 × 244). */
const K_PATH =
  "M170.2,56.7V62.1M174.4,56.7V62.1M170.2,59.4H174.4M170.2,63.1V68.5M174.4,63.1V68.5M170.2,65.8H174.4M170.2,69.5V74.9M174.4,69.5V74.9M170.2,72.2H174.4M170.2,75.9V81.3M174.4,75.9V81.3M170.2,78.6H174.4M170.2,82.3V87.7M174.4,82.3V87.7M170.2,85H174.4M170.2,88.7V94.1M174.4,88.7V94.1M170.2,91.4H174.4M170.2,95.1V100.5M174.4,95.1V100.5M170.2,97.8H174.4M170.2,101.5V106.9M174.4,101.5V106.9M170.2,104.2H174.4M170.2,107.9V113.3M174.4,107.9V113.3M170.2,110.6H174.4M176.1,56.7V62.1M180.3,56.7V62.1M176.1,59.4H180.3M176.1,63.1V68.5M180.3,63.1V68.5M176.1,65.8H180.3M176.1,69.5V74.9M180.3,69.5V74.9M176.1,72.2H180.3M176.1,75.9V81.3M180.3,75.9V81.3M176.1,78.6H180.3M176.1,82.3V87.7M180.3,82.3V87.7M176.1,85H180.3M176.1,88.7V94.1M180.3,88.7V94.1M176.1,91.4H180.3M176.1,95.1V100.5M180.3,95.1V100.5M176.1,97.8H180.3M176.1,101.5V106.9M180.3,101.5V106.9M176.1,104.2H180.3M176.1,107.9V113.3M180.3,107.9V113.3M176.1,110.6H180.3M182,82.3V87.7M186.2,82.3V87.7M182,85H186.2M182,75.9V81.3M186.2,75.9V81.3M182,78.6H186.2M182,88.7V94.1M186.2,88.7V94.1M182,91.4H186.2M187.9,75.9V81.3M192.1,75.9V81.3M187.9,78.6H192.1M187.9,88.7V94.1M192.1,88.7V94.1M187.9,91.4H192.1M187.9,69.5V74.9M192.1,69.5V74.9M187.9,72.2H192.1M187.9,95.1V100.5M192.1,95.1V100.5M187.9,97.8H192.1M193.8,69.5V74.9M198,69.5V74.9M193.8,72.2H198M193.8,95.1V100.5M198,95.1V100.5M193.8,97.8H198M193.8,63.1V68.5M198,63.1V68.5M193.8,65.8H198M193.8,101.5V106.9M198,101.5V106.9M193.8,104.2H198M199.7,63.1V68.5M203.9,63.1V68.5M199.7,65.8H203.9M199.7,101.5V106.9M203.9,101.5V106.9M199.7,104.2H203.9M199.7,56.7V62.1M203.9,56.7V62.1M199.7,59.4H203.9M199.7,107.9V113.3M203.9,107.9V113.3M199.7,110.6H203.9M205.6,56.7V62.1M209.8,56.7V62.1M205.6,59.4H209.8M205.6,107.9V113.3M209.8,107.9V113.3M205.6,110.6H209.8";

const FONT = { fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" };

/**
 * Losange double + K : l'emblème seul.
 * `kStroke` épaissit les petits « H » quand le logo est affiché petit (sinon ils deviennent
 * une simple texture) ; 0.7 = épaisseur du logo d'origine.
 */
function Emblem({ kStroke = 0.7 }: { kStroke?: number }) {
  return (
    <g>
      <polygon points="912,67 1270,425 912,783 554,425" className="fill-none stroke-logo-gold" strokeWidth="13" />
      <polygon
        points="912,112 1225,425 912,738 599,425"
        className="fill-none stroke-logo-gold"
        strokeWidth="5"
        strokeOpacity="0.6"
      />
      <path
        d={K_PATH}
        transform="translate(912 425) scale(6.05) translate(-190 -85)"
        className="fill-none stroke-logo-gold"
        strokeWidth={kStroke}
      />
    </g>
  );
}

export interface BrandLabels {
  label: string;
  name: string;
  suffix: string;
  signature: string;
}

/** Logo complet empilé (emblème, KROOL, filet, HOLDING, signature). */
export function KroolLogo({
  labels,
  tone = "dark",
  kStroke,
  className,
}: {
  labels: BrandLabels;
  tone?: "light" | "dark";
  kStroke?: number;
  className?: string;
}) {
  return (
    <svg viewBox="296 40 1242 1378" role="img" aria-label={labels.label} className={cn("h-auto", className)}>
      <Emblem kStroke={kStroke} />
      <g style={FONT} aria-hidden>
        <text x="316" y="1060" textLength="1202" lengthAdjust="spacing" fontSize="272" fontWeight="400" className="fill-logo-gold">
          {labels.name}
        </text>
        <line x1="672" y1="1152" x2="1152" y2="1152" className="stroke-logo-line" strokeWidth="5" strokeOpacity="0.6" />
        <text
          x="684"
          y="1270"
          textLength="456"
          lengthAdjust="spacing"
          fontSize="108"
          className={tone === "dark" ? "fill-white" : "fill-black"}
        >
          {labels.suffix}
        </text>
        <text x="392" y="1394" textLength="1063" lengthAdjust="spacingAndGlyphs" fontSize="70" className="fill-logo-gold">
          {labels.signature}
        </text>
      </g>
    </svg>
  );
}

/** Emblème seul (losange + K), pour les petites tailles. Décoratif par défaut. */
export function KroolMark({
  className,
  title,
  kStroke = 1.2,
}: {
  className?: string;
  title?: string;
  kStroke?: number;
}) {
  return (
    <svg
      viewBox="540 53 744 744"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <Emblem kStroke={kStroke} />
    </svg>
  );
}
