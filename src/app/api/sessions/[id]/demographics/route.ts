import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/:id/demographics
// Body: { name, email?, gender?, ageBand?, occupation? }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "الاسم مطلوب." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { id }, select: { submittedAt: true } });
  if (!session) {
    return NextResponse.json({ error: "الجلسة غير موجودة." }, { status: 404 });
  }
  if (session.submittedAt) {
    return NextResponse.json({ error: "تم إرسال هذه الجلسة بالفعل." }, { status: 409 });
  }

  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  await prisma.session.update({
    where: { id },
    data: {
      name,
      email: str(body.email),
      gender: str(body.gender),
      ageBand: str(body.ageBand),
      occupation: str(body.occupation),
    },
  });

  return NextResponse.json({ ok: true });
}
