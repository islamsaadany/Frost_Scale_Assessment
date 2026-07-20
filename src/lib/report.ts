// Builds the individual report from a stored session. Pure data assembly.
// Interpretive text is limited to what the booklet prints (dimension
// label + band label + the raw score); no invented narrative.

import {
  BANDS,
  DIMENSIONS,
  TOTAL_MAX,
  TOTAL_MIN,
  bandForRaw,
  type BandId,
  type DimensionId,
} from "@/data/dimensions";
import { computeScores } from "@/lib/scoring";

export interface ReportDimension {
  id: DimensionId;
  name: string;
  shortName: string;
  english: string;
  interpretation: string;
  raw: number;
  min: number;
  max: number;
  fraction: number;
  band: BandId;
  bandLabel: string;
  bands: { band: BandId; label: string; min: number; max: number }[];
}

export interface ReportData {
  name: string | null;
  submittedAt: string | null;
  total: {
    raw: number;
    min: number;
    max: number;
    fraction: number;
    band: BandId;
    bandLabel: string;
  };
  dimensions: ReportDimension[];
}

interface StoredSession {
  name: string | null;
  submittedAt: Date | null;
  dimensionScores: unknown;
  totalScore: number | null;
  totalBand: string | null;
  responses: { questionId: number; value: number }[];
}

const TOTAL_BAND_RANGES = [
  { band: "low" as BandId, min: 35, max: 70 },
  { band: "mid" as BandId, min: 71, max: 105 },
  { band: "high" as BandId, min: 106, max: 155 },
  { band: "severe" as BandId, min: 156, max: 175 },
];

export function buildReport(session: StoredSession): ReportData {
  let scores = session.dimensionScores as
    | Record<DimensionId, { raw: number; band: BandId }>
    | null;
  let total = session.totalScore;
  let totalBand = session.totalBand as BandId | null;

  if (!scores || total == null || !totalBand) {
    const answers: Record<number, number> = {};
    for (const r of session.responses) answers[r.questionId] = r.value;
    const computed = computeScores(answers);
    scores = computed.dimensionScores;
    total = computed.total;
    totalBand = computed.totalBand;
  }

  const dimensions: ReportDimension[] = DIMENSIONS.map((dim) => {
    const raw = scores![dim.id]?.raw ?? dim.min;
    const band = scores![dim.id]?.band ?? bandForRaw(raw, dim.bands);
    const span = dim.max - dim.min || 1;
    const fraction = Math.min(1, Math.max(0, (raw - dim.min) / span));
    return {
      id: dim.id,
      name: dim.name,
      shortName: dim.shortName,
      english: dim.english,
      interpretation: dim.interpretation,
      raw,
      min: dim.min,
      max: dim.max,
      fraction,
      band,
      bandLabel: BANDS[band].label,
      bands: dim.bands.map((b) => ({
        band: b.band,
        label: BANDS[b.band].label,
        min: b.min,
        max: b.max,
      })),
    };
  });

  const totalSpan = TOTAL_MAX - TOTAL_MIN || 1;
  const totalFraction = Math.min(1, Math.max(0, (total - TOTAL_MIN) / totalSpan));

  return {
    name: session.name,
    submittedAt: session.submittedAt ? session.submittedAt.toISOString() : null,
    total: {
      raw: total,
      min: TOTAL_MIN,
      max: TOTAL_MAX,
      fraction: totalFraction,
      band: totalBand,
      bandLabel: BANDS[totalBand].label,
    },
    dimensions,
  };
}

export { TOTAL_BAND_RANGES };
