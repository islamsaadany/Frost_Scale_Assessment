"use client";

export interface SpiderAxis {
  label: string;
  /** 0..1 */
  fraction: number;
}

// A dependency-free radar/spider chart. Renders N axes evenly around a
// circle, with concentric grid rings and a filled value polygon.
// Split a long Arabic label into at most two balanced lines so wide names
// (e.g. "الشكوك بشأن التصرفات") don't collide with their neighbours.
function wrapLabel(label: string): string[] {
  const words = label.split(" ");
  if (words.length < 2 || label.length <= 10) return [label];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(i).join(" ").length;
    if (Math.abs(a - b) < bestDiff) {
      bestDiff = Math.abs(a - b);
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

export function SpiderChart({
  axes,
  size = 340,
}: {
  axes: SpiderAxis[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 78; // leave room for wrapped labels
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1];

  // Start at the top (−90°) and go clockwise.
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * radius * r, cy + Math.sin(a) * radius * r] as const;
  };

  const valuePoints = axes
    .map((ax, i) => point(i, Math.max(0.04, ax.fraction)))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: size }}
      role="img"
      aria-label="مخطط الأبعاد"
      className="mx-auto"
    >
      {/* Grid rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={axes
            .map((_, i) => point(i, r))
            .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
            .join(" ")}
          fill="none"
          stroke="#E0D3BF"
          strokeWidth={1}
        />
      ))}

      {/* Spokes */}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E0D3BF" strokeWidth={1} />;
      })}

      {/* Value polygon */}
      <polygon points={valuePoints} fill="#D9884A" fillOpacity={0.28} stroke="#B96C34" strokeWidth={2} />
      {axes.map((ax, i) => {
        const [x, y] = point(i, Math.max(0.04, ax.fraction));
        return <circle key={i} cx={x} cy={y} r={3.5} fill="#B96C34" />;
      })}

      {/* Labels (wrapped to ≤2 lines, pushed outside the grid) */}
      {axes.map((ax, i) => {
        const [x, y] = point(i, 1.14);
        const anchor = Math.abs(x - cx) < 10 ? "middle" : x > cx ? "start" : "end";
        const lines = wrapLabel(ax.label);
        const y0 = y - ((lines.length - 1) * 12) / 2;
        return (
          <text
            key={i}
            x={x}
            y={y0}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={10.5}
            fill="#5A5149"
            fontWeight={700}
          >
            {lines.map((ln, li) => (
              <tspan key={li} x={x} dy={li === 0 ? 0 : 12}>
                {ln}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}
