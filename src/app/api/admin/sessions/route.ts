import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";

// GET /api/admin/sessions — list submitted respondent sessions.
export async function GET() {
  if (!(await getAdminId())) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: { submittedAt: { not: null } },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      submittedAt: true,
      totalScore: true,
      totalBand: true,
      accessCode: { select: { code: true } },
    },
    take: 500,
  });

  return NextResponse.json({ sessions });
}
