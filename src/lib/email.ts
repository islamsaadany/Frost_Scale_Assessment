import { Resend } from "resend";
import { SCALE_TITLE } from "@/data/constants";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const brand = "#DF803E";
const ink = "#2A2521";
const soft = "#5A5149";

export async function sendReportEmail(opts: {
  to: string;
  name: string | null;
  pdf: Buffer;
  reportUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("email_not_configured");

  const resend = new Resend(apiKey);
  const greetingName = opts.name?.trim() ? opts.name.trim() : "";

  const html = `
  <div dir="rtl" style="font-family:'Tajawal','Segoe UI',Tahoma,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:${ink};text-align:right;">
    <h1 style="font-size:24px;font-weight:800;color:${brand};text-align:center;margin:0 0 16px;">${SCALE_TITLE}</h1>
    <p style="font-size:15px;line-height:1.9;color:${soft};margin:0 0 12px;">
      ${greetingName ? `مرحبًا ${greetingName}،` : "مرحبًا،"}
    </p>
    <p style="font-size:15px;line-height:1.9;color:${soft};margin:0 0 12px;">
      شكرًا لإكمالك مقياس فروست. تجد نتيجتك الفردية مرفقةً بهذا البريد كملف PDF،
      وتشمل درجتك العامة ونتائجك عبر الأبعاد السبعة.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${opts.reportUrl}" style="display:inline-block;padding:12px 28px;background:${brand};color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">
        عرض النتيجة التفاعلية
      </a>
    </div>
    <p style="font-size:12px;line-height:1.8;color:#9A8E7E;text-align:center;margin:24px 0 0;">
      هذه أداة توعوية للتأمل الذاتي وليست تشخيصًا طبيًا أو نفسيًا.
    </p>
  </div>`;

  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: "نتيجتك في مقياس فروست",
    html,
    attachments: [{ filename: "frost-report.pdf", content: opts.pdf }],
  });

  if (error) throw new Error(error.message || "email_send_failed");
}
