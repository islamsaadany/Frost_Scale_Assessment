"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { findInFlightSessionId } from "@/lib/take-storage";

const GENDERS = ["ذكر", "أنثى", "أفضّل عدم الإفصاح"];
const AGE_BANDS = ["أقل من 18", "18–24", "25–34", "35–44", "45–54", "55 فأكثر"];

export default function DemographicsPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [occupation, setOccupation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = findInFlightSessionId();
    if (!id) {
      router.replace("/");
      return;
    }
    setSessionId(id);
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("الاسم مطلوب.");
      return;
    }
    if (!sessionId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/demographics`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, gender, ageBand, occupation }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "تعذّر حفظ البيانات.");
        return;
      }
      router.push("/take/question/1");
    } catch {
      setError("تعذّر الاتصال بالخادم، حاول مجددًا.");
    } finally {
      setBusy(false);
    }
  };

  if (!sessionId) return null;

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-ink">بياناتك</h2>

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink-soft">
          الاسم <span className="text-brand">*</span>
        </label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="field" />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-soft">
          البريد الإلكتروني <span className="text-ink-muted">(اختياري)</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field ltr-nums text-right"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gender" className="mb-2 block text-sm font-medium text-ink-soft">
            الجنس <span className="text-ink-muted">(اختياري)</span>
          </label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="field">
            <option value="">—</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="age" className="mb-2 block text-sm font-medium text-ink-soft">
            الفئة العمرية <span className="text-ink-muted">(اختياري)</span>
          </label>
          <select id="age" value={ageBand} onChange={(e) => setAgeBand(e.target.value)} className="field">
            <option value="">—</option>
            {AGE_BANDS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="occupation" className="mb-2 block text-sm font-medium text-ink-soft">
          المهنة <span className="text-ink-muted">(اختياري)</span>
        </label>
        <input
          id="occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          className="field"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-band-severe/10 px-3 py-2 text-sm text-band-severe">{error}</p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "جارٍ الحفظ…" : "ابدأ الأسئلة"}
      </button>
    </form>
  );
}
