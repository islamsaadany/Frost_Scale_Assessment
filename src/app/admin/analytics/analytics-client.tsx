"use client";

import { useEffect, useState } from "react";
import { BAND_PALETTES } from "@/data/constants";
import { BANDS, BAND_ORDER, type BandId } from "@/data/dimensions";

const C = BAND_PALETTES.severity;

interface Analytics {
  overall: { codes: number; started: number; completed: number; completionRate: number };
  bands: Record<BandId, number>;
  dimensions: {
    id: string;
    name: string;
    avg: number;
    min: number;
    max: number;
    fraction: number;
    band: BandId;
  }[];
  demographics: { gender: Record<string, number>; ageBand: Record<string, number> };
  codes: {
    id: string;
    code: string;
    description: string;
    isActive: boolean;
    maxUses: number;
    currentUses: number;
    started: number;
    completed: number;
    completionRate: number;
  }[];
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4 text-center">
      <div className="ltr-nums text-2xl font-extrabold text-brand-dark">{value}</div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
    </div>
  );
}

function CountBars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, v]) => v));
  return (
    <div className="space-y-2">
      {data.map(([label, v]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-ink-soft">{label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-canvas-muted">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.round((v / max) * 100)}%` }}
            />
          </div>
          <span className="ltr-nums w-8 text-left text-xs font-bold text-ink">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsClient() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">التحليلات</h1>
        <a href="/admin" className="btn-ghost">
          رجوع إلى اللوحة
        </a>
      </header>

      {loading || !data ? (
        <p className="text-sm text-ink-muted">جارٍ التحميل…</p>
      ) : (
        <div className="space-y-8">
          {/* Overall */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="الرموز" value={data.overall.codes} />
            <Stat label="بدؤوا" value={data.overall.started} />
            <Stat label="أكملوا" value={data.overall.completed} />
            <Stat label="نسبة الإكمال" value={`${data.overall.completionRate}%`} />
          </div>

          {/* Band distribution */}
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">توزيع النتيجة العامة</h2>
            <div className="space-y-2">
              {BAND_ORDER.map((b) => {
                const v = data.bands[b] ?? 0;
                const total = Math.max(1, data.overall.completed);
                return (
                  <div key={b} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-ink-soft">{BANDS[b].label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-canvas-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.round((v / total) * 100)}%`, backgroundColor: C[b] }}
                      />
                    </div>
                    <span className="ltr-nums w-8 text-left text-xs font-bold text-ink">{v}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dimension averages */}
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">متوسط الأبعاد</h2>
            <div className="space-y-3">
              {data.dimensions.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs font-medium text-ink">{d.name}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-canvas-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round(d.fraction * 100)}%`, backgroundColor: C[d.band] }}
                    />
                  </div>
                  <span className="ltr-nums w-16 text-left text-xs font-bold text-ink-soft">
                    {d.avg} / {d.max}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Demographics */}
          <section className="grid gap-6 sm:grid-cols-2">
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">الجنس</h2>
              <CountBars data={Object.entries(data.demographics.gender)} />
            </div>
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">الفئة العمرية</h2>
              <CountBars data={Object.entries(data.demographics.ageBand)} />
            </div>
          </section>

          {/* Per-code */}
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">حسب الرمز</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-canvas-muted text-right text-xs text-ink-muted">
                    <th className="py-2 font-medium">الرمز</th>
                    <th className="py-2 font-medium">الوصف</th>
                    <th className="py-2 font-medium">الاستخدام</th>
                    <th className="py-2 font-medium">بدؤوا</th>
                    <th className="py-2 font-medium">أكملوا</th>
                    <th className="py-2 font-medium">الإكمال</th>
                  </tr>
                </thead>
                <tbody>
                  {data.codes.map((c) => (
                    <tr key={c.id} className="border-b border-canvas-muted/60">
                      <td className="ltr-nums py-2 text-right font-bold text-brand-dark">{c.code}</td>
                      <td className="py-2 text-ink-soft">{c.description || "—"}</td>
                      <td className="ltr-nums py-2 text-right text-ink-soft">
                        {c.currentUses} / {c.maxUses}
                      </td>
                      <td className="ltr-nums py-2 text-right text-ink-soft">{c.started}</td>
                      <td className="ltr-nums py-2 text-right text-ink-soft">{c.completed}</td>
                      <td className="ltr-nums py-2 text-right font-bold text-ink">{c.completionRate}%</td>
                    </tr>
                  ))}
                  {data.codes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-ink-muted">
                        لا توجد بيانات بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
