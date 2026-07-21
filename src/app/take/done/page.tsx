"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, findInFlightSessionId } from "@/lib/take-storage";

type SendState = "idle" | "sending" | "sent" | "error" | "unavailable";

export default function DonePage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = findInFlightSessionId();
    if (!id) {
      router.replace("/");
      return;
    }
    setSessionId(id);

    // Prefill the email from the saved demographics (best-effort).
    fetch(`/api/sessions/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.session?.email) setEmail(data.session.email as string);
      })
      .catch(() => {});

    // Submitted already; clear the in-flight cache so a refresh doesn't
    // drop the user back into the questions.
    clearSession();
  }, [router]);

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    setError(null);
    setState("sending");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.status === 503) {
        setState("unavailable");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "تعذّر الإرسال.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setState("error");
    }
  };

  if (!sessionId) return null;

  return (
    <div className="card space-y-6 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 text-2xl">
        ✓
      </div>
      <h2 className="text-xl font-bold text-ink">تم إرسال إجاباتك</h2>
      <p className="text-sm leading-relaxed text-ink-soft">
        شكرًا لك. نتيجتك الفردية جاهزة الآن عبر الأبعاد السبعة.
      </p>

      <a href={`/report/${sessionId}`} className="btn-primary w-full">
        عرض نتيجتي
      </a>

      {/* Email the PDF */}
      {state === "sent" ? (
        <p className="rounded-xl bg-band-mid/25 px-3 py-3 text-sm font-medium text-ink">
          تم إرسال نتيجتك إلى بريدك كملف PDF. تحقّق من صندوق الوارد (أو الرسائل غير
          المرغوبة).
        </p>
      ) : state === "unavailable" ? (
        <p className="rounded-xl bg-canvas-muted px-3 py-3 text-sm text-ink-soft">
          خدمة إرسال البريد غير مُفعّلة حاليًا. يمكنك عرض نتيجتك وحفظها كـ PDF من صفحة
          النتيجة.
        </p>
      ) : (
        <form onSubmit={sendEmail} className="space-y-3 border-t border-canvas-muted pt-6 text-right">
          <label htmlFor="email" className="block text-sm font-medium text-ink-soft">
            هل ترغب باستلام نتيجتك على بريدك كملف PDF؟
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="field ltr-nums text-right"
          />
          {error && <p className="text-sm text-band-severe">{error}</p>}
          <button type="submit" disabled={state === "sending"} className="btn-ghost w-full">
            {state === "sending" ? "جارٍ الإرسال…" : "أرسل نتيجتي إلى بريدي"}
          </button>
        </form>
      )}
    </div>
  );
}
