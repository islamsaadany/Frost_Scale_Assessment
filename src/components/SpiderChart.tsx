"use client";

export interface SpiderAxis {
  label: string;
  /** 0..1 */
  fraction: number;
}

// A dependency-free radar/spider chart. Renders N axes evenly around a
// circle, with concentric grid rings and a filled value polygon.
export function SpiderChart({
  axes,
  size = 320,
}: {
  axes: SpiderAxis[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 56; // leave room for labels
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

      {/* Labels */}
      {axes.map((ax, i) => {
        const [x, y] = point(i, 1.16);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11}
            fill="#5A5149"
            fontWeight={600}
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}
