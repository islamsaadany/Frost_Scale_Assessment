import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderUrlToPdf } from "@/lib/pdf";
import { emailConfigured, isValidEmail, sendReportEmail } from "@/lib/email";

// Chromium PDF rendering needs the Node runtime and time to boot.
export const runtime = "nodejs";
export const maxDuration = 60;

function baseUrl(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// POST /api/sessions/:id/email  Body: { email?: string }
// Emails the respondent their report as a PDF attachment.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "خدمة البريد غير مُهيّأة بعد. يرجى المحاولة لاحقًا." },
      { status: 503 },
    );
  }

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
    return NextResponse.json({ error: "يرجى إدخال بريد إلكتروني صحيح." }, { status: 400 });
  }

  const reportUrl = `${baseUrl(req)}/report/${id}`;

  try {
    const pdf = await renderUrlToPdf(`${reportUrl}?pdf=1`);
    await sendReportEmail({ to, name: session.name, pdf, reportUrl });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "email_not_configured") {
      return NextResponse.json({ error: "خدمة البريد غير مُهيّأة بعد." }, { status: 503 });
    }
    console.error("email report failed:", msg);
    return NextResponse.json(
      { error: "تعذّر إرسال البريد، حاول مجددًا." },
      { status: 500 },
    );
  }

  // Persist the recipient so the admin can see/resend it.
  if (to !== session.email) {
    await prisma.session.update({ where: { id }, data: { email: to } }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
