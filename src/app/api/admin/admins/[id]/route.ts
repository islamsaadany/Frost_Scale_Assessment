import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";

// PATCH /api/admin/admins/:id — toggle isActive.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }
  const { id } = await params;

  let body: { isActive?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "لا يوجد تغيير." }, { status: 400 });
  }
  if (id === adminId && body.isActive === false) {
    return NextResponse.json({ error: "لا يمكنك تعطيل حسابك الحالي." }, { status: 400 });
  }

  const updated = await prisma.admin
    .update({
      where: { id },
      data: { isActive: body.isActive },
      select: { id: true, email: true, name: true, isActive: true, createdAt: true },
    })
    .catch(() => null);
  if (!updated) {
    return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });
  }
  return NextResponse.json({ admin: updated });
}

// DELETE /api/admin/admins/:id — delete an admin (never yourself).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }
  const { id } = await params;

  if (id === adminId) {
    return NextResponse.json({ error: "لا يمكنك حذف حسابك الحالي." }, { status: 400 });
  }

  const deleted = await prisma.admin.delete({ where: { id } }).catch(() => null);
  if (!deleted) {
    return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
