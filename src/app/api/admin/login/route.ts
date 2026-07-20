import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

// POST /api/admin/login  Body: { email, password }
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان." }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  const ok = admin && admin.isActive && (await bcrypt.compare(password, admin.passwordHash));
  if (!ok || !admin) {
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
  }

  await setSessionCookie(admin.id);
  return NextResponse.json({ ok: true });
}
