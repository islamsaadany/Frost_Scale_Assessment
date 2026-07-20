import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";

// POST /api/admin/account/password
// Body: { currentPassword, newPassword } — changes the signed-in admin's password.
export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const newPassword = body.newPassword ?? "";
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل." },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });
  }

  const ok = await bcrypt.compare(body.currentPassword ?? "", admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة." }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({ where: { id: adminId }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
