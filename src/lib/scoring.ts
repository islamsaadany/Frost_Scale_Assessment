// The scoring engine for مقياس فروست.
//
// Input: a map of { questionId (1..35) -> Likert value (1..5) }.
// Output: per-dimension raw sums + bands, and the total (general) score
// + band. All fixed content (thresholds) comes from src/data.

import { QUESTIONS } from "@/data/questions";
import {
  DIMENSIONS,
  DIMENSIONS_BY_ID,
  TOTAL_BANDS,
  bandForRaw,
  type BandId,
  type Dimension,
  type DimensionId,
} from "@/data/dimensions";

export interface DimensionScore {
  dimension: DimensionId;
  raw: number;
  band: BandId;
  min: number;
  max: number;
  /** 0..1 position of raw within [min, max], for bars/charts. */
  fraction: number;
}

export interface ScoreResult {
  dimensions: DimensionScore[];
  /** Compact shape frozen onto Session.dimensionScores. */
  dimensionScores: Record<DimensionId, { raw: number; band: BandId }>;
  total: number;
  totalBand: BandId;
}

const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

function sumDimension(
  dim: Dimension,
  answers: Record<number, number>,
): number {
  return dim.itemIds.reduce((acc, id) => acc + (answers[id] ?? 0), 0);
}

export function computeScores(answers: Record<number, number>): ScoreResult {
  const dimensions: DimensionScore[] = DIMENSIONS.map((dim) => {
    const raw = sumDimension(dim, answers);
    const band = bandForRaw(raw, dim.bands);
    const span = dim.max - dim.min || 1;
    const fraction = Math.min(1, Math.max(0, (raw - dim.min) / span));
    return { dimension: dim.id, raw, band, min: dim.min, max: dim.max, fraction };
  });

  const dimensionScores = Object.fromEntries(
    dimensions.map((d) => [d.dimension, { raw: d.raw, band: d.band }]),
  ) as Record<DimensionId, { raw: number; band: BandId }>;

  const total = QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  const totalBand = bandForRaw(total, TOTAL_BANDS);

  return { dimensions, dimensionScores, total, totalBand };
}

/**
 * Validate a raw answers payload from the client: every key must be a
 * known question id and every value an integer 1..5. Returns a clean map
 * or throws with a human-readable (Arabic) message.
 */
export function normalizeAnswers(input: unknown): Record<number, number> {
  if (typeof input !== "object" || input === null) {
    throw new Error("صيغة الإجابات غير صحيحة.");
  }
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const qid = Number(k);
    const val = Number(v);
    if (!QUESTION_IDS.has(qid)) continue;
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      throw new Error(`قيمة غير صالحة للسؤال ${qid}.`);
    }
    out[qid] = val;
  }
  return out;
}

/** True when every one of the 35 items has an answer. */
export function isComplete(answers: Record<number, number>): boolean {
  return QUESTIONS.every((q) => typeof answers[q.id] === "number");
}

export { DIMENSIONS, DIMENSIONS_BY_ID };
