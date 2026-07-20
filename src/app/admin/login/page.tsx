"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "تعذّر تسجيل الدخول.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-2xl font-bold text-ink">لوحة الإدارة</h1>
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-soft">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field ltr-nums text-right"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink-soft">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </div>
        {error && (
          <p className="rounded-xl bg-band-severe/10 px-3 py-2 text-sm text-band-severe">{error}</p>
        )}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
    </main>
  );
}
