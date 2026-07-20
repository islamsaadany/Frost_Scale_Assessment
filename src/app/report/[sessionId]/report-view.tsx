import { SpiderChart } from "@/components/SpiderChart";
import { BandBar } from "@/components/BandBar";
import { PrintButton } from "@/components/PrintButton";
import { PageHeader } from "@/components/BrandMark";
import { BAND_PALETTES, textOn } from "@/data/constants";
import { BAND_ORDER, BANDS } from "@/data/dimensions";
import { TOTAL_LABEL } from "@/data/report-content";
import { TOTAL_BAND_RANGES, type ReportData } from "@/lib/report";

export function ReportView({ report }: { report: ReportData }) {
  const colors = BAND_PALETTES.severity;

  const chip = (band: string, label: string) => (
    <span
      className="inline-block shrink-0 rounded-full px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: colors[band], color: textOn(colors[band]) }}
    >
      {label}
    </span>
  );

  const bigScore = (raw: number, max: number, small = false) => (
    <span className="ltr-nums inline-flex items-baseline gap-1 text-brand-dark">
      <span className={small ? "text-xl font-extrabold leading-none" : "text-3xl font-extrabold leading-none sm:text-4xl"}>
        {raw}
      </span>
      <span className="text-sm font-medium text-ink-muted">/ {max}</span>
    </span>
  );

  const positionBar = (band: string, fraction: number) => (
    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas-muted">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.round(fraction * 100)}%`, backgroundColor: colors[band] }}
      />
    </div>
  );

  const legend = (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {BAND_ORDER.map((b) => (
        <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <span
            className="inline-block h-4 w-4 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: colors[b] }}
          />
          {BANDS[b].label}
        </span>
      ))}
    </div>
  );

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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <PageHeader />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
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
            <div className="mt-1">{bigScore(report.total.raw, report.total.max)}</div>
          </div>
          {chip(report.total.band, report.total.bandLabel)}
        </div>
        <div className="mt-5">
          <BandBar bands={totalSegs} activeBand={report.total.band} colors={colors} />
        </div>
      </section>

      {/* Profile: spider (right on desktop, top on mobile) + list */}
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="mb-4 text-center text-base font-bold text-ink sm:text-lg">ملفك عبر الأبعاد</h2>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <SpiderChart
              axes={report.dimensions.map((d) => ({
                label: d.shortName,
                fraction: d.fraction,
                band: d.band,
              }))}
              size={460}
              colors={colors}
            />
            {legend}
          </div>
          <div>
            {report.dimensions.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 border-b border-canvas-muted py-3.5 last:border-0"
              >
                <span className="ltr-nums flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-soft text-xs font-extrabold text-brand-dark">
                  {d.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink sm:text-base">{d.shortName}</div>
                  {positionBar(d.band, d.fraction)}
                </div>
                {chip(d.band, d.bandLabel)}
                {bigScore(d.raw, d.max, true)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
