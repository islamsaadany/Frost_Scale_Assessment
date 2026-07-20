// Shared UI constants for the take-flow and reports.

export interface LikertOption {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
}

// 5-point Likert as printed in the booklet.
export const LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: "لا أوافق بشدة" },
  { value: 2, label: "لا أوافق" },
  { value: 3, label: "محايد" },
  { value: 4, label: "أوافق" },
  { value: 5, label: "أوافق بشدة" },
];

export const LIKERT_VALUES = LIKERT_OPTIONS.map((o) => o.value);

export const SCALE_TITLE = "مقياس فروست";
export const SCALE_SUBTITLE = "متعدد الأبعاد لقياس الكمالية ومتابعتها";
export const SCALE_AUTHOR = "د. عماد رشاد عثمان";
export const SCALE_WEBSITE = "emadrashad.net";

// Tailwind class per band, for bars / chips.
export const BAND_BG: Record<string, string> = {
  low: "bg-band-low",
  mid: "bg-band-mid",
  high: "bg-band-high",
  severe: "bg-band-severe",
};

export const BAND_TEXT_ON: Record<string, string> = {
  low: "text-ink",
  mid: "text-ink",
  high: "text-white",
  severe: "text-white",
};

// Hex equivalents of the band palette, for SVG (spider chart, legend).
// Kept in sync with tailwind.config.ts `band`.
export const BAND_HEX: Record<string, string> = {
  low: "#F4DEBE",
  mid: "#EDAF66",
  high: "#CA6316",
  severe: "#542D12",
};

// Two selectable colour schemes for the report:
//  - warm     : the booklet's terracotta ramp (cream → brown)
//  - severity : green → red, reading low → high as a risk gradient
export type PaletteId = "warm" | "severity";

export const BAND_PALETTES: Record<PaletteId, Record<string, string>> = {
  warm: {
    low: "#F4DEBE",
    mid: "#EDAF66",
    high: "#CA6316",
    severe: "#542D12",
  },
  severity: {
    low: "#4E9A5A", // green
    mid: "#E3B23C", // amber
    high: "#E07B2E", // orange
    severe: "#C0392B", // red
  },
};

export const PALETTE_LABELS: Record<PaletteId, string> = {
  warm: "الألوان الأصلية",
  severity: "أخضر ← أحمر",
};

// Pick a legible text colour (ink or white) for a given background hex.
export function textOn(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#2A2521" : "#FFFFFF";
}
