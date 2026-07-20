// Builds the fully-resolved individual report from a stored session.
// Pure data assembly — no DB, no React — so it can be unit-checked and
// reused by both the report page and (later) a PDF/email exporter.

import {
  BANDS,
  DIMENSIONS,
  TOTAL_BANDS,
  TOTAL_MAX,
  TOTAL_MIN,
  bandForRaw,
  type BandId,
  type DimensionId,
} from "@/data/dimensions";
import { DIMENSION_REPORT, DISCLAIMER, TOTAL_REPORT } from "@/data/report-content";
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
  intro: string;
  summary: string;
  guidance?: string;
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
    summary: string;
    guidance?: string;
  };
  dimensions: ReportDimension[];
  disclaimer: string;
}

interface StoredSession {
  name: string | null;
  submittedAt: Date | null;
  dimensionScores: unknown;
  totalScore: number | null;
  totalBand: string | null;
  responses: { questionId: number; value: number }[];
}

export function buildReport(session: StoredSession): ReportData {
  // Prefer frozen scores; recompute from raw responses if absent.
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
    const copy = DIMENSION_REPORT[dim.id];
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
      intro: copy.intro,
      summary: copy.bands[band].summary,
      guidance: copy.bands[band].guidance,
    };
  });

  const totalSpan = TOTAL_MAX - TOTAL_MIN || 1;
  const totalFraction = Math.min(1, Math.max(0, (total - TOTAL_MIN) / totalSpan));
  const totalCopy = TOTAL_REPORT[totalBand];

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
      summary: totalCopy.summary,
      guidance: totalCopy.guidance,
    },
    dimensions,
    disclaimer: DISCLAIMER,
  };
}

export { TOTAL_BANDS };
