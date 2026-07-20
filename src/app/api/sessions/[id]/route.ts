import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/:id
// Returns session status + answers-so-far, so the take-flow can resume.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      submittedAt: true,
      responses: { select: { questionId: true, value: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "الجلسة غير موجودة." }, { status: 404 });
  }

  const answersByQuestionId: Record<number, number> = {};
  for (const r of session.responses) answersByQuestionId[r.questionId] = r.value;

  return NextResponse.json({
    session: {
      id: session.id,
      name: session.name,
      submittedAt: session.submittedAt,
    },
    answersByQuestionId,
  });
}
