import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

// POST /api/admin/login  Body: { password }
// Password-only access: match the password against any active admin.
export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!password) {
    return NextResponse.json({ error: "كلمة المرور مطلوبة." }, { status: 400 });
  }

  const admins = await prisma.admin.findMany({ where: { isActive: true } });

  let matched: (typeof admins)[number] | null = null;
  for (const a of admins) {
    if (await bcrypt.compare(password, a.passwordHash)) {
      matched = a;
      break;
    }
  }

  if (!matched) {
    return NextResponse.json({ error: "كلمة المرور غير صحيحة." }, { status: 401 });
  }

  await setSessionCookie(matched.id);
  return NextResponse.json({ ok: true });
}
