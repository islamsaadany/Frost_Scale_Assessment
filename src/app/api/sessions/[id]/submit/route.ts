import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScores, isComplete } from "@/lib/scoring";

// POST /api/sessions/:id/submit
// Requires all 35 items answered + a saved name. Computes and freezes the
// scores onto the Session, stamps submittedAt, and returns the id.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    select: {
      submittedAt: true,
      name: true,
      responses: { select: { questionId: true, value: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "الجلسة غير موجودة." }, { status: 404 });
  }
  if (session.submittedAt) {
    // Idempotent: already submitted → just report success.
    return NextResponse.json({ sessionId: id, alreadySubmitted: true });
  }
  if (!session.name) {
    return NextResponse.json({ error: "بيانات المشارك ناقصة." }, { status: 400 });
  }

  const answers: Record<number, number> = {};
  for (const r of session.responses) answers[r.questionId] = r.value;

  if (!isComplete(answers)) {
    return NextResponse.json(
      { error: "يرجى الإجابة عن جميع الأسئلة قبل الإرسال." },
      { status: 400 },
    );
  }

  const result = computeScores(answers);

  await prisma.session.update({
    where: { id },
    data: {
      submittedAt: new Date(),
      dimensionScores: result.dimensionScores,
      totalScore: result.total,
      totalBand: result.totalBand,
    },
  });

  return NextResponse.json({ sessionId: id });
}
