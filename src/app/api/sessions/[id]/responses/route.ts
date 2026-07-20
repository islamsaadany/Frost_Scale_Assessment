import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeAnswers } from "@/lib/scoring";

// PATCH /api/sessions/:id/responses
// Body: { answers: [{ questionId: number, value: 1..5 }] }
// Upserts each answer. Idempotent — safe to re-send the full set.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { answers?: Array<{ questionId?: unknown; value?: unknown }> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const list = Array.isArray(body.answers) ? body.answers : [];
  const asMap: Record<string, unknown> = {};
  for (const a of list) asMap[String(a.questionId)] = a.value;

  let clean: Record<number, number>;
  try {
    clean = normalizeAnswers(asMap);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id },
    select: { submittedAt: true },
  });
  if (!session) {
    return NextResponse.json({ error: "الجلسة غير موجودة." }, { status: 404 });
  }
  if (session.submittedAt) {
    return NextResponse.json({ error: "تم إرسال هذه الجلسة بالفعل." }, { status: 409 });
  }

  const entries = Object.entries(clean);
  if (entries.length > 0) {
    await prisma.$transaction(
      entries.map(([qid, value]) =>
        prisma.response.upsert({
          where: { sessionId_questionId: { sessionId: id, questionId: Number(qid) } },
          create: { sessionId: id, questionId: Number(qid), value },
          update: { value },
        }),
      ),
    );
  }

  return NextResponse.json({ ok: true, saved: entries.length });
}
