import { prisma } from "@/lib/prisma";
import { buildReport } from "@/lib/report";
import { BrandMark } from "@/components/BrandMark";
import { ReportView } from "./report-view";

export const metadata = { title: "نتيجتك — مقياس فروست" };
export const dynamic = "force-dynamic";

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

  return <ReportView report={buildReport(session)} />;
}
