/**
 * Schéma en nœud papillon (bow-tie), méthode de référence en analyse de risques :
 * causes → barrières de prévention → événement redouté → barrières de protection → conséquences.
 * SVG pur, aucune image : net à toutes les tailles et très léger.
 */
export interface BowTieLabels {
  threats: string;
  event: string;
  consequences: string;
  prevention: string;
  protection: string;
}

const ROWS = [70, 160, 250];
const CENTER = { x: 300, y: 160 };

export function BowTieDiagram({ labels, title }: { labels: BowTieLabels; title: string }) {
  return (
    <svg viewBox="0 0 600 330" role="img" aria-labelledby="bowtie-title" className="h-auto w-full">
      <title id="bowtie-title">{title}</title>

      {/* Liaisons causes → événement → conséquences */}
      <g className="stroke-gold-500/50" strokeWidth="1.25" fill="none">
        {ROWS.map((y) => (
          <g key={y}>
            <path d={`M 92 ${y} C 190 ${y}, 220 ${CENTER.y}, ${CENTER.x - 52} ${CENTER.y}`} />
            <path d={`M ${CENTER.x + 52} ${CENTER.y} C 380 ${CENTER.y}, 410 ${y}, 508 ${y}`} />
          </g>
        ))}
      </g>

      {/* Barrières */}
      <g className="fill-gold-500">
        {[150, 196, 404, 450].map((x) => (
          <rect key={x} x={x - 3} y="52" width="6" height="216" rx="1" opacity="0.85" />
        ))}
      </g>

      {/* Nœuds causes et conséquences */}
      {ROWS.map((y, i) => (
        <g key={y}>
          <rect x="20" y={y - 14} width="72" height="28" rx="3" className="fill-ink-900 stroke-gold-500/60" />
          <text x="56" y={y + 4} textAnchor="middle" className="fill-slate-300 text-[11px]">
            {`C${i + 1}`}
          </text>
          <rect x="508" y={y - 14} width="72" height="28" rx="3" className="fill-ink-900 stroke-gold-500/60" />
          <text x="544" y={y + 4} textAnchor="middle" className="fill-slate-300 text-[11px]">
            {`Q${i + 1}`}
          </text>
        </g>
      ))}

      {/* Événement redouté */}
      <circle cx={CENTER.x} cy={CENTER.y} r="52" className="fill-ink-950 stroke-gold-400" strokeWidth="2" />
      <circle cx={CENTER.x} cy={CENTER.y} r="60" className="fill-none stroke-gold-500/30" strokeWidth="1" />
      <foreignObject x={CENTER.x - 46} y={CENTER.y - 24} width="92" height="48">
        <div className="flex h-full items-center justify-center text-center font-serif text-[12px] leading-tight text-gold-300">
          {labels.event}
        </div>
      </foreignObject>

      {/* Légendes */}
      <g className="fill-slate-300 text-[11px] tracking-wide uppercase">
        <text x="56" y="30" textAnchor="middle">{labels.threats}</text>
        <text x="544" y="30" textAnchor="middle">{labels.consequences}</text>
      </g>
      <g className="fill-gold-400 text-[11px]">
        <text x="173" y="300" textAnchor="middle">{labels.prevention}</text>
        <text x="427" y="300" textAnchor="middle">{labels.protection}</text>
      </g>
    </svg>
  );
}
