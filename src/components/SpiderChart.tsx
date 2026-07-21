"use client";

import { BAND_HEX } from "@/data/constants";
import type { BandId } from "@/data/dimensions";

export interface SpiderAxis {
  label: string;
  /** 0..1 */
  fraction: number;
  band?: BandId;
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
  // Small grid + generous margin so labels sit clearly outside, even when a
  // vertex reaches the outer ring.
  const radius = size / 2 - Math.round(size * 0.33);
  const labelGap = Math.round(size * 0.13);
  const boxW = Math.round(size * 0.24);
  const boxH = Math.round(size * 0.13);
  const fontSize = Math.max(10, Math.round(size * 0.026));
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * radius * r, cy + Math.sin(a) * radius * r] as const;
  };
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

      {/* Vertices — colored by band */}
      {axes.map((ax, i) => {
        const [x, y] = point(i, Math.max(0.04, ax.fraction));
        const fill = ax.band ? colors[ax.band] : "#B96C34";
        return (
          <circle key={i} cx={x} cy={y} r={5.5} fill={fill} stroke="#fff" strokeWidth={1.5} />
        );
      })}

      {/* Labels via foreignObject — real HTML text so Arabic shapes and
          wraps correctly on every browser (SVG <tspan> mis-renders RTL
          Arabic on Safari/iOS). */}
      {axes.map((ax, i) => {
        const [x, y] = labelPoint(i);
        return (
          <foreignObject
            key={i}
            x={x - boxW / 2}
            y={y - boxH / 2}
            width={boxW}
            height={boxH}
            style={{ overflow: "visible" }}
          >
            <div
              dir="rtl"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                lineHeight: 1.15,
                fontSize,
                fontWeight: 700,
                fontFamily: "inherit",
                color: "#5A5149",
              }}
            >
              {ax.label}
            </div>
          </foreignObject>
        );
      })}
    </svg>
  );
}
