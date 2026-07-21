import { renderUrlToPdf } from "@/lib/pdf";
import { sendReportEmail } from "@/lib/email";

/** Resolve the public base URL of the current request (proto + host). */
export function requestBaseUrl(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Render a session's report to PDF and email it to `to`. */
export async function renderAndSendReport(opts: {
  baseUrl: string;
  sessionId: string;
  to: string;
  name: string | null;
}): Promise<void> {
  const reportUrl = `${opts.baseUrl}/report/${opts.sessionId}`;
  const pdf = await renderUrlToPdf(`${reportUrl}?pdf=1`);
  await sendReportEmail({ to: opts.to, name: opts.name, pdf, reportUrl });
}
