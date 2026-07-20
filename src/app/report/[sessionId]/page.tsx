import { prisma } from "@/lib/prisma";
import { buildReport, TOTAL_BAND_RANGES } from "@/lib/report";
import { SpiderChart } from "@/components/SpiderChart";
import { PrintButton } from "@/components/PrintButton";
import { BandBar } from "@/components/BandBar";
import { DimensionPill } from "@/components/DimensionPill";
import { PageHeader, BrandMark } from "@/components/BrandMark";
import { BAND_BG, BAND_TEXT_ON, BAND_HEX } from "@/data/constants";
import { BANDS, BAND_ORDER } from "@/data/dimensions";
import { TOTAL_LABEL } from "@/data/report-content";

export const metadata = { title: "نتيجتك — مقياس فروست" };
export const dynamic = "force-dynamic";

function BandChip({ band, label }: { band: string; label: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${BAND_BG[band]} ${BAND_TEXT_ON[band]}`}
    >
      {label}
    </span>
  );
}

function BigScore({ raw, max }: { raw: number; max: number }) {
  return (
    <div className="ltr-nums flex items-baseline gap-1 text-brand-dark">
      <span className="text-3xl font-extrabold leading-none sm:text-4xl">{raw}</span>
      <span className="text-base font-medium text-ink-muted">/ {max}</span>
    </div>
  );
}

// Band legend, mirroring the STP report's colour key.
function BandLegend() {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {BAND_ORDER.map((b) => (
        <span key={b} className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: BAND_HEX[b] }}
          />
          {BANDS[b].label}
        </span>
      ))}
    </div>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      name: true,
      submittedAt: true,
      dimensionScores: true,
      totalScore: true,
      totalBand: true,
      responses: { select: { questionId: true, value: true } },
    },
  });

  if (!session || !session.submittedAt) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <BrandMark />
        <p className="mt-8 text-sm text-ink-soft">لم نعثر على نتيجة مكتملة لهذه الجلسة.</p>
        <a href="/" className="btn-ghost mt-6">
          العودة إلى البداية
        </a>
      </main>
    );
  }

  const report = buildReport(session);
  const dateStr = report.submittedAt
    ? new Date(report.submittedAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const totalSegs = TOTAL_BAND_RANGES.map((r) => ({
    band: r.band,
    label: BANDS[r.band].label,
    min: r.min,
    max: r.max,
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <PageHeader />
        <div className="mt-6 flex items-end justify-between">
          <div>
            {report.name && <p className="text-lg font-bold text-ink">{report.name}</p>}
            {dateStr && <p className="ltr-nums text-xs text-ink-muted">{dateStr}</p>}
          </div>
          <PrintButton />
        </div>
      </header>

      {/* Total score */}
      <section className="card p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-ink sm:text-lg">{TOTAL_LABEL}</h2>
          <BandChip band={report.total.band} label={report.total.bandLabel} />
        </div>
        <div className="mb-4">
          <BigScore raw={report.total.raw} max={report.total.max} />
        </div>
        <BandBar bands={totalSegs} activeBand={report.total.band} />
      </section>

      {/* Spider chart + band legend */}
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="mb-4 text-center text-base font-bold text-ink sm:text-lg">ملفك عبر الأبعاد</h2>
        <SpiderChart
          axes={report.dimensions.map((d) => ({
            label: d.shortName,
            fraction: d.fraction,
            band: d.band,
          }))}
        />
        <BandLegend />
      </section>

      {/* Per-dimension breakdown */}
      <section className="mt-6 space-y-4">
        {report.dimensions.map((d) => (
          <article key={d.id} className="card p-6">
            <div className="mb-4 flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <span className="ltr-nums flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-soft text-sm font-extrabold text-brand-dark">
                  {d.order}
                </span>
                <DimensionPill arabic={d.shortName} english={d.english} />
              </div>
              <p className="text-xs text-ink-muted">{d.interpretation}</p>
            </div>
            <div className="mb-3 flex items-end justify-between">
              <BigScore raw={d.raw} max={d.max} />
              <BandChip band={d.band} label={d.bandLabel} />
            </div>
            <BandBar bands={d.bands} activeBand={d.band} />
          </article>
        ))}
      </section>
    </main>
  );
}
