import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import {
  DIMENSIONS,
  bandForRaw,
  type BandId,
  type DimensionId,
} from "@/data/dimensions";

// GET /api/admin/analytics — aggregate stats for access codes + submissions.
export async function GET() {
  if (!(await getAdminId())) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  const [codes, sessions] = await Promise.all([
    prisma.accessCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.session.findMany({
      select: {
        accessCodeId: true,
        submittedAt: true,
        totalBand: true,
        dimensionScores: true,
        gender: true,
        ageBand: true,
      },
    }),
  ]);

  const completed = sessions.filter((s) => s.submittedAt);

  // Overall
  const overall = {
    codes: codes.length,
    started: sessions.length,
    completed: completed.length,
    completionRate: sessions.length ? Math.round((completed.length / sessions.length) * 100) : 0,
  };

  // Band distribution (of the total score) among completed
  const bands: Record<BandId, number> = { low: 0, mid: 0, high: 0, severe: 0 };
  for (const s of completed) {
    if (s.totalBand && s.totalBand in bands) bands[s.totalBand as BandId] += 1;
  }

  // Per-dimension average raw + its band (only over sessions that have
  // stored scores).
  const scored = completed.filter((s) => s.dimensionScores);
  const sums: Record<DimensionId, number> = Object.fromEntries(
    DIMENSIONS.map((d) => [d.id, 0]),
  ) as Record<DimensionId, number>;
  for (const s of scored) {
    const ds = s.dimensionScores as Record<DimensionId, { raw: number }> | null;
    if (!ds) continue;
    for (const d of DIMENSIONS) sums[d.id] += ds[d.id]?.raw ?? 0;
  }
  const dimensions = DIMENSIONS.map((d) => {
    const avg = scored.length ? sums[d.id] / scored.length : 0;
    return {
      id: d.id,
      name: d.shortName,
      avg: Math.round(avg * 10) / 10,
      min: d.min,
      max: d.max,
      fraction: Math.min(1, Math.max(0, (avg - d.min) / (d.max - d.min || 1))),
      band: bandForRaw(Math.round(avg), d.bands),
    };
  });

  // Demographics (completed)
  const tally = (key: "gender" | "ageBand") => {
    const out: Record<string, number> = {};
    for (const s of completed) {
      const v = (s[key] ?? "غير محدد") as string;
      out[v] = (out[v] ?? 0) + 1;
    }
    return out;
  };
  const demographics = { gender: tally("gender"), ageBand: tally("ageBand") };

  // Per-code
  const startedByCode = new Map<string, number>();
  const completedByCode = new Map<string, number>();
  for (const s of sessions) {
    if (!s.accessCodeId) continue;
    startedByCode.set(s.accessCodeId, (startedByCode.get(s.accessCodeId) ?? 0) + 1);
    if (s.submittedAt)
      completedByCode.set(s.accessCodeId, (completedByCode.get(s.accessCodeId) ?? 0) + 1);
  }
  const codeStats = codes.map((c) => {
    const started = startedByCode.get(c.id) ?? 0;
    const done = completedByCode.get(c.id) ?? 0;
    return {
      id: c.id,
      code: c.code,
      description: c.description,
      isActive: c.isActive,
      maxUses: c.maxUses,
      currentUses: c.currentUses,
      started,
      completed: done,
      completionRate: started ? Math.round((done / started) * 100) : 0,
    };
  });

  return NextResponse.json({ overall, bands, dimensions, demographics, codes: codeStats });
}
