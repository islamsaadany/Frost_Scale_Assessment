"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BANDS, type BandId } from "@/data/dimensions";
import { BAND_BG, BAND_TEXT_ON } from "@/data/constants";

interface CodeRow {
  id: string;
  code: string;
  description: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  _count: { sessions: number };
}

interface SessionRow {
  id: string;
  name: string | null;
  email: string | null;
  submittedAt: string | null;
  totalScore: number | null;
  totalBand: BandId | null;
  accessCode: { code: string } | null;
}

export function AdminClient() {
  const router = useRouter();
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const [c, s] = await Promise.all([
      fetch("/api/admin/access-codes").then((r) => r.json()),
      fetch("/api/admin/sessions").then((r) => r.json()),
    ]);
    setCodes(c.codes ?? []);
    setSessions(s.sessions ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description, maxUses }),
      });
      setDescription("");
      setMaxUses(1);
      await load();
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/access-codes/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">لوحة الإدارة</h1>
        <button onClick={logout} className="btn-ghost">
          خروج
        </button>
      </header>

      {loading ? (
        <p className="text-sm text-ink-muted">جارٍ التحميل…</p>
      ) : (
        <div className="space-y-10">
          {/* Access codes */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-ink">رموز الدخول</h2>

            <form onSubmit={createCode} className="card mb-4 flex flex-wrap items-end gap-3 p-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-ink-soft">الوصف</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: مجموعة أكتوبر"
                  className="field"
                />
              </div>
              <div className="w-28">
                <label className="mb-1 block text-xs text-ink-soft">عدد الاستخدامات</label>
                <input
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="field ltr-nums text-center"
                />
              </div>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? "…" : "توليد رمز"}
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-canvas-muted text-right text-xs text-ink-muted">
                    <th className="py-2 font-medium">الرمز</th>
                    <th className="py-2 font-medium">الوصف</th>
                    <th className="py-2 font-medium">الاستخدام</th>
                    <th className="py-2 font-medium">الحالة</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b border-canvas-muted/60">
                      <td className="ltr-nums py-2 font-bold text-brand-dark">{c.code}</td>
                      <td className="py-2 text-ink-soft">{c.description || "—"}</td>
                      <td className="ltr-nums py-2 text-ink-soft">
                        {c.currentUses} / {c.maxUses}
                      </td>
                      <td className="py-2">
                        <span
                          className={
                            c.isActive
                              ? "rounded-full bg-band-mid/30 px-2 py-0.5 text-xs text-ink"
                              : "rounded-full bg-canvas-muted px-2 py-0.5 text-xs text-ink-muted"
                          }
                        >
                          {c.isActive ? "مُفعّل" : "معطّل"}
                        </span>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => toggle(c.id, c.isActive)}
                          className="text-xs text-brand-dark hover:underline"
                        >
                          {c.isActive ? "تعطيل" : "تفعيل"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {codes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-ink-muted">
                        لا توجد رموز بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Submissions */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-ink">المشاركات ({sessions.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-canvas-muted text-right text-xs text-ink-muted">
                    <th className="py-2 font-medium">الاسم</th>
                    <th className="py-2 font-medium">الرمز</th>
                    <th className="py-2 font-medium">النتيجة</th>
                    <th className="py-2 font-medium">المستوى</th>
                    <th className="py-2 font-medium">التاريخ</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-canvas-muted/60">
                      <td className="py-2 font-medium text-ink">{s.name || "—"}</td>
                      <td className="ltr-nums py-2 text-ink-soft">{s.accessCode?.code ?? "—"}</td>
                      <td className="ltr-nums py-2 text-ink-soft">{s.totalScore ?? "—"}</td>
                      <td className="py-2">
                        {s.totalBand && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${BAND_BG[s.totalBand]} ${BAND_TEXT_ON[s.totalBand]}`}
                          >
                            {BANDS[s.totalBand].label}
                          </span>
                        )}
                      </td>
                      <td className="ltr-nums py-2 text-xs text-ink-muted">
                        {s.submittedAt
                          ? new Date(s.submittedAt).toLocaleDateString("ar-EG")
                          : "—"}
                      </td>
                      <td className="py-2">
                        <a
                          href={`/report/${s.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand-dark hover:underline"
                        >
                          عرض التقرير
                        </a>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-ink-muted">
                        لا توجد مشاركات بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
