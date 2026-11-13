/**
 * Matrice de criticité 5 × 5 (gravité × probabilité), outil central des études de dangers.
 * Couleurs des états (tokens success / warning / danger) ; libellés traduits.
 */
export interface RiskMatrixLabels {
  title: string;
  likelihood: string;
  severity: string;
  legend: string;
  low: string;
  medium: string;
  high: string;
}

function level(score: number): "low" | "medium" | "high" {
  if (score <= 4) return "low";
  if (score <= 10) return "medium";
  return "high";
}

const FILL = {
  low: "fill-success",
  medium: "fill-warning",
  high: "fill-danger",
} as const;

const CELL = 44;
const ORIGIN = { x: 56, y: 12 };

export function RiskMatrix({ labels }: { labels: RiskMatrixLabels }) {
  const cells = [];
  for (let severity = 1; severity <= 5; severity++) {
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const score = severity * likelihood;
      cells.push(
        <g key={`${severity}-${likelihood}`}>
          <rect
            x={ORIGIN.x + (likelihood - 1) * CELL}
            y={ORIGIN.y + (5 - severity) * CELL}
            width={CELL - 3}
            height={CELL - 3}
            rx="3"
            className={FILL[level(score)]}
          />
          <text
            x={ORIGIN.x + (likelihood - 1) * CELL + (CELL - 3) / 2}
            y={ORIGIN.y + (5 - severity) * CELL + (CELL - 3) / 2 + 4}
            textAnchor="middle"
            className="fill-white text-[12px] font-medium"
          >
            {score}
          </text>
        </g>,
      );
    }
  }

  const gridSize = CELL * 5;
  return (
    <figure className="w-full max-w-sm">
      <svg viewBox="0 0 300 300" role="img" aria-labelledby="risk-matrix-title" className="h-auto w-full">
        <title id="risk-matrix-title">{labels.title}</title>
        {cells}
        {/* Axes */}
        <g className="fill-slate-600 text-[11px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <g key={n}>
              <text x={ORIGIN.x + (n - 1) * CELL + (CELL - 3) / 2} y={ORIGIN.y + gridSize + 14} textAnchor="middle">
                {n}
              </text>
              <text x={ORIGIN.x - 10} y={ORIGIN.y + (5 - n) * CELL + (CELL - 3) / 2 + 4} textAnchor="end">
                {n}
              </text>
            </g>
          ))}
        </g>
        <text
          x={ORIGIN.x + gridSize / 2}
          y={ORIGIN.y + gridSize + 34}
          textAnchor="middle"
          className="fill-ink-950 text-[12px] font-semibold"
        >
          {labels.likelihood} →
        </text>
        <text
          transform={`translate(16 ${ORIGIN.y + gridSize / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-ink-950 text-[12px] font-semibold"
        >
          {labels.severity} →
        </text>
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="sr-only">{labels.legend} :</span>
        {(["low", "medium", "high"] as const).map((key) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={`size-3 rounded-xs ${key === "low" ? "bg-success" : key === "medium" ? "bg-warning" : "bg-danger"}`} />
            {labels[key]}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
