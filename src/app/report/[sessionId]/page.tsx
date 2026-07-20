import { prisma } from "@/lib/prisma";
import { buildReport } from "@/lib/report";
import { SpiderChart } from "@/components/SpiderChart";
import { PrintButton } from "@/components/PrintButton";
import { BrandMark } from "@/components/BrandMark";
import { BAND_BG, BAND_TEXT_ON } from "@/data/constants";

export const metadata = { title: "نتيجتك — مقياس فروست" };

// The report is always fetched fresh (scores are frozen at submit).
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

function ScoreBar({ band, fraction }: { band: string; fraction: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas-muted">
      <div
        className={`h-full rounded-full ${BAND_BG[band]}`}
        style={{ width: `${Math.round(fraction * 100)}%` }}
      />
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
        <BrandMark compact />
        <p className="mt-8 text-sm text-ink-soft">
          لم نعثر على نتيجة مكتملة لهذه الجلسة.
        </p>
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 flex flex-col items-center gap-4">
        <BrandMark compact />
        <div className="text-center">
          {report.name && <p className="text-lg font-bold text-ink">{report.name}</p>}
          {dateStr && <p className="ltr-nums text-xs text-ink-muted">{dateStr}</p>}
        </div>
        <PrintButton />
      </header>

      {/* Total score */}
      <section className="card p-6 sm:p-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">المقياس العام للكمالية</h2>
          <BandChip band={report.total.band} label={report.total.bandLabel} />
        </div>
        <p className="ltr-nums mb-2 text-sm text-ink-muted">
          {report.total.raw} / {report.total.max}
        </p>
        <ScoreBar band={report.total.band} fraction={report.total.fraction} />
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{report.total.summary}</p>
        {report.total.guidance && (
          <p className="mt-2 rounded-xl bg-canvas-muted p-3 text-sm leading-relaxed text-ink-soft">
            {report.total.guidance}
          </p>
        )}
      </section>

      {/* Spider chart */}
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="mb-4 text-center text-lg font-bold text-ink">ملفك عبر الأبعاد</h2>
        <SpiderChart
          axes={report.dimensions.map((d) => ({ label: d.shortName, fraction: d.fraction }))}
        />
      </section>

      {/* Per-dimension breakdown */}
      <section className="mt-6 space-y-4">
        {report.dimensions.map((d) => (
          <article key={d.id} className="card p-6">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">{d.name}</h3>
                <p className="text-xs text-ink-muted">
                  {d.english} · {d.interpretation}
                </p>
              </div>
              <BandChip band={d.band} label={d.bandLabel} />
            </div>
            <p className="ltr-nums mb-2 text-xs text-ink-muted">
              {d.raw} / {d.max}
            </p>
            <ScoreBar band={d.band} fraction={d.fraction} />
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">{d.intro}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d.summary}</p>
            {d.guidance && (
              <p className="mt-2 rounded-xl bg-canvas-muted p-3 text-sm leading-relaxed text-ink-soft">
                {d.guidance}
              </p>
            )}
          </article>
        ))}
      </section>

      <footer className="mt-8">
        <p className="rounded-xl border border-canvas-muted bg-white p-4 text-center text-xs leading-relaxed text-ink-muted">
          {report.disclaimer}
        </p>
      </footer>
    </main>
  );
}
