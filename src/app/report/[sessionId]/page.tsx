import { prisma } from "@/lib/prisma";
import { buildReport, TOTAL_BAND_RANGES } from "@/lib/report";
import { SpiderChart } from "@/components/SpiderChart";
import { PrintButton } from "@/components/PrintButton";
import { BandBar } from "@/components/BandBar";
import { PageHeader, BrandMark } from "@/components/BrandMark";
import { BAND_BG, BAND_TEXT_ON, BAND_HEX } from "@/data/constants";
import { BANDS, BAND_ORDER } from "@/data/dimensions";
import { TOTAL_LABEL } from "@/data/report-content";

export const metadata = { title: "نتيجتك — مقياس فروست" };
export const dynamic = "force-dynamic";

function BandChip({ band, label }: { band: string; label: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-bold ${BAND_BG[band]} ${BAND_TEXT_ON[band]}`}
    >
      {label}
    </span>
  );
}

function BigScore({ raw, max, size = "lg" }: { raw: number; max: number; size?: "lg" | "sm" }) {
  return (
    <span className="ltr-nums inline-flex items-baseline gap-1 text-brand-dark">
      <span className={size === "lg" ? "text-3xl font-extrabold leading-none sm:text-4xl" : "text-xl font-extrabold leading-none"}>
        {raw}
      </span>
      <span className="text-sm font-medium text-ink-muted">/ {max}</span>
    </span>
  );
}

function PositionBar({ band, fraction }: { band: string; fraction: number }) {
  return (
    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas-muted">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.round(fraction * 100)}%`, backgroundColor: BAND_HEX[band] }}
      />
    </div>
  );
}

function BandLegend() {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {BAND_ORDER.map((b) => (
        <span key={b} className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: BAND_HEX[b] }} />
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
      <header className="mb-6">
        <PageHeader />
        <div className="mt-6 flex items-end justify-between">
          <div>
            {report.name && <p className="text-lg font-bold text-ink">{report.name}</p>}
            {dateStr && <p className="ltr-nums text-xs text-ink-muted">{dateStr}</p>}
          </div>
          <PrintButton />
        </div>
      </header>

      {/* Total score hero */}
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink-muted">{TOTAL_LABEL}</p>
            <div className="mt-1">
              <BigScore raw={report.total.raw} max={report.total.max} />
            </div>
          </div>
          <BandChip band={report.total.band} label={report.total.bandLabel} />
        </div>
        <div className="mt-5">
          <BandBar bands={totalSegs} activeBand={report.total.band} />
        </div>
      </section>

      {/* Profile chart — full width so labels stay large and readable */}
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="mb-2 text-center text-base font-bold text-ink sm:text-lg">ملفك عبر الأبعاد</h2>
        <SpiderChart
          axes={report.dimensions.map((d) => ({
            label: d.shortName,
            fraction: d.fraction,
            band: d.band,
          }))}
          size={480}
        />
        <BandLegend />
      </section>

      {/* Compact dimension list */}
      <section className="card mt-6 p-4 sm:p-6">
        {report.dimensions.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 border-b border-canvas-muted py-3 last:border-0"
          >
            <span className="ltr-nums flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-soft text-xs font-extrabold text-brand-dark">
              {d.order}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-ink">{d.shortName}</div>
              <PositionBar band={d.band} fraction={d.fraction} />
            </div>
            <BandChip band={d.band} label={d.bandLabel} />
            <BigScore raw={d.raw} max={d.max} size="sm" />
          </div>
        ))}
      </section>
    </main>
  );
}
