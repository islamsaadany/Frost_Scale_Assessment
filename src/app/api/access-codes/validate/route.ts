import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/code";

// POST /api/access-codes/validate
// Body: { code: string }
// On success, opens a new respondent Session and returns its id.
export async function POST(req: Request) {
  let body: { code?: string };
  try {
    body = (await req.json()) as { code?: string };
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const code = normalizeCode(body.code ?? "");
  if (!code) {
    return NextResponse.json({ error: "يرجى إدخال رمز الدخول." }, { status: 400 });
  }

  const accessCode = await prisma.accessCode.findUnique({ where: { code } });
  if (!accessCode || !accessCode.isActive) {
    return NextResponse.json({ error: "رمز الدخول غير صحيح." }, { status: 404 });
  }
  if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
    return NextResponse.json({ error: "انتهت صلاحية رمز الدخول." }, { status: 410 });
  }
  if (accessCode.currentUses >= accessCode.maxUses) {
    return NextResponse.json(
      { error: "تم استنفاد عدد مرات استخدام هذا الرمز." },
      { status: 409 },
    );
  }

  // Atomically bump the counter and open a session.
  const session = await prisma.$transaction(async (tx) => {
    const bumped = await tx.accessCode.updateMany({
      where: { id: accessCode.id, currentUses: { lt: accessCode.maxUses } },
      data: { currentUses: { increment: 1 } },
    });
    if (bumped.count === 0) {
      throw new Error("exhausted");
    }
    return tx.session.create({
      data: { accessCodeId: accessCode.id },
      select: { id: true },
    });
  }).catch(() => null);

  if (!session) {
    return NextResponse.json(
      { error: "تم استنفاد عدد مرات استخدام هذا الرمز." },
      { status: 409 },
    );
  }

  return NextResponse.json({ sessionId: session.id });
}
