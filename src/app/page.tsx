"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/BrandMark";
import {
  SCALE_AUTHOR,
  SCALE_SUBTITLE,
  SCALE_TITLE,
  SCALE_WEBSITE,
} from "@/data/constants";
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover px-4 py-12 text-white">
      {/* Subtle admin entry, mirroring the Corporate Endurance landing. */}
      <Link
        href="/admin/login"
        className="absolute left-4 top-4 z-20 text-xs text-white/50 transition hover:text-white/90 sm:left-6 sm:top-6"
      >
        دخول المشرف
      </Link>

      {/* Cube artwork from the booklet cover, faded into the dark bg. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('/cover-cube.jpg')",
          maskImage: "linear-gradient(to bottom, transparent, black 55%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 55%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <Logo size={64} />

        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-brand sm:text-6xl">
          {SCALE_TITLE}
        </h1>

        <p className="mt-4 rounded-lg bg-brand px-4 py-2 text-center text-sm font-bold text-white sm:text-base">
          {SCALE_SUBTITLE}
        </p>

        <p className="mt-4 text-xs text-white/70">{SCALE_WEBSITE}</p>
        <p className="mt-1 text-sm font-medium text-white/90">{SCALE_AUTHOR}</p>

        {/* Code entry */}
        <form onSubmit={onSubmit} className="mt-10 w-full space-y-4 rounded-2xl bg-white/95 p-6 text-ink shadow-xl">
          <label htmlFor="code" className="block text-sm font-medium text-ink-soft">
            رمز الدخول
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="FROST1"
            autoComplete="off"
            className="field text-center text-lg tracking-[0.3em]"
          />
          {error && (
            <p className="rounded-xl bg-band-severe/10 px-3 py-2 text-sm text-band-severe">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "جارٍ التحقق…" : "ابدأ المقياس"}
          </button>
        </form>
      </div>
    </main>
  );
}
