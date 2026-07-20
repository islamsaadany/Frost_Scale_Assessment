import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { generateCode } from "@/lib/code";

// GET /api/admin/access-codes — list all codes with usage.
export async function GET() {
  if (!(await getAdminId())) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  const codes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sessions: true } } },
  });

  return NextResponse.json({ codes });
}

// POST /api/admin/access-codes — create a new code.
// Body: { description?, maxUses?, expiresAt? }
export async function POST(req: Request) {
  if (!(await getAdminId())) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  let body: { description?: string; maxUses?: number; expiresAt?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const maxUses = Number.isInteger(body.maxUses) && body.maxUses! > 0 ? body.maxUses! : 1;
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return NextResponse.json({ error: "تاريخ الانتهاء غير صالح." }, { status: 400 });
  }

  // Retry a few times on the (very unlikely) unique-collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      const created = await prisma.accessCode.create({
        data: {
          code,
          description: (body.description ?? "").trim(),
          maxUses,
          expiresAt,
        },
      });
      return NextResponse.json({ code: created });
    } catch {
      // collision → try another code
    }
  }

  return NextResponse.json({ error: "تعذّر توليد رمز فريد، حاول مجددًا." }, { status: 500 });
}
