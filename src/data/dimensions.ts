// The 7 dimensions (أبعاد) of مقياس فروست and their band thresholds.
//
// Each dimension is scored by summing its item values (Likert 1..5). The
// raw sum is mapped to one of four bands. Thresholds are transcribed from
// the "كيفية التصحيح" pages of the booklet, with two corrections noted
// against the source:
//   1. Item 29 is de-duplicated, so البُعد السادس has 7 items (25..31).
//   2. البُعد السادس's high/severe rows are misprinted in the booklet
//      (they repeat another dimension's numbers). They are corrected here
//      to a consistent ramp over the 7-item range (7..35).

export type DimensionId = "CM" | "PS" | "O" | "PE" | "PC" | "DA" | "GEN";
export type BandId = "low" | "mid" | "high" | "severe";

export interface Band {
  id: BandId;
  label: string;
}

export const BANDS: Record<BandId, Band> = {
  low: { id: "low", label: "منخفض" },
  mid: { id: "mid", label: "متوسط" },
  high: { id: "high", label: "عالية" },
  severe: { id: "severe", label: "مرضية شديدة" },
};

export const BAND_ORDER: BandId[] = ["low", "mid", "high", "severe"];

export interface BandRange {
  band: BandId;
  /** inclusive */
  min: number;
  /** inclusive */
  max: number;
}

export interface Dimension {
  id: DimensionId;
  order: number;
  /** Full Arabic heading, e.g. "البُعد الأول: الانشغال بالأخطاء". */
  name: string;
  /** Short Arabic name, e.g. "الانشغال بالأخطاء". */
  shortName: string;
  english: string;
  /** Interpretive label from the scoring key. */
  interpretation: string;
  itemIds: number[];
  min: number;
  max: number;
  /** Ordered low → severe, contiguous, covering [min, max]. */
  bands: BandRange[];
}

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const DIMENSIONS: Dimension[] = [
  {
    id: "CM",
    order: 1,
    name: "البُعد الأول: الانشغال بالأخطاء",
    shortName: "الانشغال بالأخطاء",
    english: "Concern over Mistakes",
    interpretation: "متخوف — ناقد لذاته عند حدوث الخطأ",
    itemIds: range(1, 9),
    min: 9,
    max: 45,
    bands: [
      { band: "low", min: 9, max: 18 },
      { band: "mid", min: 19, max: 29 },
      { band: "high", min: 30, max: 40 },
      { band: "severe", min: 41, max: 45 },
    ],
  },
  {
    id: "PS",
    order: 2,
    name: "البُعد الثاني: المعايير الشخصية",
    shortName: "المعايير الشخصية",
    english: "Personal Standards",
    interpretation: "المعايير الذاتية العالية",
    itemIds: range(10, 14),
    min: 5,
    max: 25,
    bands: [
      { band: "low", min: 5, max: 10 },
      { band: "mid", min: 11, max: 15 },
      { band: "high", min: 16, max: 20 },
      { band: "severe", min: 21, max: 25 },
    ],
  },
  {
    id: "O",
    order: 3,
    name: "البُعد الثالث: التنظيم والترتيب",
    shortName: "التنظيم والترتيب",
    english: "Organization",
    interpretation: "فرط التنظيم والترتيب",
    itemIds: range(15, 18),
    min: 4,
    max: 20,
    bands: [
      { band: "low", min: 4, max: 8 },
      { band: "mid", min: 9, max: 12 },
      { band: "high", min: 13, max: 17 },
      { band: "severe", min: 18, max: 20 },
    ],
  },
  {
    id: "PE",
    order: 4,
    name: "البُعد الرابع: التوقعات الوالدية",
    shortName: "التوقعات الوالدية",
    english: "Parental Expectations",
    interpretation: "الإدراك الذاتي للضغط الوالدي",
    itemIds: range(19, 21),
    min: 3,
    max: 15,
    bands: [
      { band: "low", min: 3, max: 3 },
      { band: "mid", min: 4, max: 6 },
      { band: "high", min: 7, max: 10 },
      { band: "severe", min: 11, max: 15 },
    ],
  },
  {
    id: "PC",
    order: 5,
    name: "البُعد الخامس: النقد الوالدي",
    shortName: "النقد الوالدي",
    english: "Parental Criticism",
    interpretation: "النقد الوالدي الصارم",
    itemIds: range(22, 24),
    min: 3,
    max: 15,
    bands: [
      { band: "low", min: 3, max: 3 },
      { band: "mid", min: 4, max: 6 },
      { band: "high", min: 7, max: 10 },
      { band: "severe", min: 11, max: 15 },
    ],
  },
  {
    id: "DA",
    order: 6,
    name: "البُعد السادس: الشكوك بشأن التصرفات",
    shortName: "الشكوك بشأن التصرفات",
    english: "Doubts about Actions",
    interpretation: "الشك المزمن والقلق المستدام",
    itemIds: range(25, 31),
    min: 7,
    max: 35,
    // Corrected ramp — see file header note (2).
    bands: [
      { band: "low", min: 7, max: 14 },
      { band: "mid", min: 15, max: 21 },
      { band: "high", min: 22, max: 28 },
      { band: "severe", min: 29, max: 35 },
    ],
  },
  {
    id: "GEN",
    order: 7,
    name: "البُعد السابع: بنود عامة",
    shortName: "بنود عامة",
    english: "General (Unclassified)",
    interpretation: "مؤشرات عامة على النزعة الكمالية",
    itemIds: range(32, 35),
    min: 4,
    max: 20,
    bands: [
      { band: "low", min: 4, max: 8 },
      { band: "mid", min: 9, max: 12 },
      { band: "high", min: 13, max: 17 },
      { band: "severe", min: 18, max: 20 },
    ],
  },
];

export const DIMENSIONS_BY_ID: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimensionId, Dimension>;

// ── Total (general perfectionism) scale ──────────────────────────────
export const TOTAL_MIN = 35;
export const TOTAL_MAX = 175;
export const TOTAL_BANDS: BandRange[] = [
  { band: "low", min: 35, max: 70 },
  { band: "mid", min: 71, max: 105 },
  { band: "high", min: 106, max: 155 },
  { band: "severe", min: 156, max: 175 },
];

/** Map a raw sum to a band id using an ordered, contiguous range list. */
export function bandForRaw(raw: number, ranges: BandRange[]): BandId {
  for (const r of ranges) {
    if (raw >= r.min && raw <= r.max) return r.band;
  }
  // Clamp to the ends if a rounding edge falls outside.
  return raw < ranges[0].min ? ranges[0].band : ranges[ranges.length - 1].band;
}
