import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { emailConfigured, isValidEmail } from "@/lib/email";
import { renderAndSendReport, requestBaseUrl } from "@/lib/report-email";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/sessions/:id/email  Body: { email?: string }
// Admin resends a submission's report PDF (to the address on file, or an
// override in the body).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminId())) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  if (!emailConfigured()) {
    return NextResponse.json({ error: "خدمة البريد غير مُهيّأة بعد." }, { status: 503 });
  }

  const { id } = await params;

  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    body = {};
  }

  const session = await prisma.session.findUnique({
    where: { id },
    select: { name: true, email: true, submittedAt: true },
  });
  if (!session || !session.submittedAt) {
    return NextResponse.json({ error: "لا توجد نتيجة مكتملة." }, { status: 404 });
  }

  const to = (body.email ?? session.email ?? "").trim();
  if (!to || !isValidEmail(to)) {
    return NextResponse.json({ error: "لا يوجد بريد صالح لهذه المشاركة." }, { status: 400 });
  }

  try {
    await renderAndSendReport({ baseUrl: requestBaseUrl(req), sessionId: id, to, name: session.name });
  } catch (e) {
    console.error("admin resend failed:", (e as Error).message);
    return NextResponse.json({ error: "تعذّر إرسال البريد." }, { status: 500 });
  }

  if (to !== session.email) {
    await prisma.session.update({ where: { id }, data: { email: to } }).catch(() => null);
  }

  return NextResponse.json({ ok: true, to });
}
