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
