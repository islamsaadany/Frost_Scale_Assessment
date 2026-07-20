import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";

// PATCH /api/admin/access-codes/:id — toggle isActive or edit maxUses.
// Body: { isActive?: boolean, maxUses?: number }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminId())) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }
  const { id } = await params;

  let body: { isActive?: boolean; maxUses?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const data: { isActive?: boolean; maxUses?: number } = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (Number.isInteger(body.maxUses) && body.maxUses! > 0) data.maxUses = body.maxUses!;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "لا يوجد تغيير." }, { status: 400 });
  }

  const updated = await prisma.accessCode
    .update({ where: { id }, data })
    .catch(() => null);
  if (!updated) {
    return NextResponse.json({ error: "الرمز غير موجود." }, { status: 404 });
  }

  return NextResponse.json({ code: updated });
}
