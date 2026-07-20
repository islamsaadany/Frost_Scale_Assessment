"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { saveSessionId } from "@/lib/take-storage";
import { normalizeCode } from "@/lib/code";

export default function LandingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = normalizeCode(code);
    if (!clean) {
      setError("يرجى إدخال رمز الدخول.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/access-codes/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
      const data = (await res.json()) as { sessionId?: string; error?: string };
      if (!res.ok || !data.sessionId) {
        setError(data.error ?? "تعذّر التحقق من الرمز.");
        return;
      }
      saveSessionId(data.sessionId);
      router.push("/take/welcome");
    } catch {
      setError("تعذّر الاتصال بالخادم، حاول مجددًا.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-12">
      <BrandMark />

      <form onSubmit={onSubmit} className="card mt-10 w-full space-y-5 p-6 sm:p-8">
        <div>
          <label htmlFor="code" className="mb-2 block text-sm font-medium text-ink-soft">
            رمز الدخول
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="مثال: FROST1"
            autoComplete="off"
            className="field text-center text-lg tracking-widest"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-band-severe/10 px-3 py-2 text-sm text-band-severe">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "جارٍ التحقق…" : "ابدأ المقياس"}
        </button>
      </form>

      <p className="mt-6 max-w-md text-center text-xs leading-relaxed text-ink-muted">
        أداة توعوية للتأمل الذاتي وليست تشخيصًا طبيًا أو نفسيًا.
      </p>
    </main>
  );
}
