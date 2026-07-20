"use client";

import { BAND_HEX } from "@/data/constants";
import type { BandId } from "@/data/dimensions";

export interface SpiderAxis {
  label: string;
  /** 0..1 */
  fraction: number;
  band?: BandId;
}

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
  size = 440,
  colors = BAND_HEX,
}: {
  axes: SpiderAxis[];
  size?: number;
  colors?: Record<string, string>;
}) {
  const cx = size / 2;
  const cy = size / 2;
  // Margins scale with size so labels stay well outside the grid at any
  // size — even when a vertex sits on the outer ring (fraction 1.0).
  const margin = Math.round(size * 0.32);
  const radius = size / 2 - margin;
  const labelGap = Math.round(size * 0.1);
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * radius * r, cy + Math.sin(a) * radius * r] as const;
  };
  // Labels sit a fixed gap OUTSIDE the outer ring so they never touch the
  // grid or the value polygon.
  const labelPoint = (i: number) => {
    const a = angleFor(i);
    const r = radius + labelGap;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
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
      <polygon points={valuePoints} fill="#D9884A" fillOpacity={0.22} stroke="#B96C34" strokeWidth={2} />

      {/* Vertices — colored by band so highs/severes pop */}
      {axes.map((ax, i) => {
        const [x, y] = point(i, Math.max(0.04, ax.fraction));
        const fill = ax.band ? colors[ax.band] : "#B96C34";
        return (
          <circle key={i} cx={x} cy={y} r={5.5} fill={fill} stroke="#fff" strokeWidth={1.5} />
        );
      })}

      {/* Labels — placed outside the grid. Multi-line labels are anchored
          away from the centre (up above the chart, down below it) so their
          inner line never reaches back toward the vertices. */}
      {axes.map((ax, i) => {
        const [x, y] = labelPoint(i);
        const anchor = Math.abs(x - cx) < 12 ? "middle" : x > cx ? "start" : "end";
        const lines = wrapLabel(ax.label);
        const lineH = 13;
        const extra = (lines.length - 1) * lineH;
        const y0 = y < cy - 6 ? y - extra : y > cy + 6 ? y : y - extra / 2;
        return (
          <text
            key={i}
            x={x}
            y={y0}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={12}
            fill="#5A5149"
            fontWeight={700}
          >
            {lines.map((ln, li) => (
              <tspan key={li} x={x} dy={li === 0 ? 0 : 13}>
                {ln}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}
