import { BAND_HEX } from "@/data/constants";
import type { BandId } from "@/data/dimensions";

interface Seg {
  band: BandId;
  label: string;
  min: number;
  max: number;
}

// The 4-segment band bar from the booklet's "كيفية التصحيح" pages.
// Segments run منخفض → مرضية شديدة; in RTL the first (منخفض) sits on the
// right. The respondent's band is highlighted; the others are dimmed.
// Colours come from `colors` so the report's palette toggle applies here.
export function BandBar({
  bands,
  activeBand,
  colors = BAND_HEX,
}: {
  bands: Seg[];
  activeBand: BandId;
  colors?: Record<string, string>;
}) {
  return (
    <div>
      <div className="mb-1 flex">
        {bands.map((b) => (
          <div key={b.band} className="flex-1 px-1 text-center">
            <div className="ltr-nums text-[10px] font-bold text-ink-soft">
              {b.min}–{b.max}
            </div>
            <div
              className={
                "text-[10px] " +
                (b.band === activeBand ? "font-extrabold text-ink" : "text-ink-muted")
              }
            >
              {b.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {bands.map((b) => (
          <div
            key={b.band}
            className={"flex-1 transition " + (b.band === activeBand ? "" : "opacity-30")}
            style={{ backgroundColor: colors[b.band] }}
          />
        ))}
      </div>
    </div>
  );
}
