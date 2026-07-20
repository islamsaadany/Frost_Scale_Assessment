import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";

// GET /api/admin/admins — list admins (+ id of the signed-in admin).
export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ admins, currentId: adminId });
}

// POST /api/admin/admins — create a new admin.
// Body: { email, name, password }
export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  let body: { email?: string; name?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const password = body.password ?? "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "بريد إلكتروني غير صالح." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "الاسم مطلوب." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const admin = await prisma.admin.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ error: "هذا البريد مستخدم بالفعل." }, { status: 409 });
  }
}
