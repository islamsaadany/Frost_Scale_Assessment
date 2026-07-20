"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminRow {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

function Notice({ msg }: { msg: { kind: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <p
      className={
        "rounded-xl px-3 py-2 text-sm " +
        (msg.kind === "ok"
          ? "bg-band-mid/25 text-ink"
          : "bg-band-severe/10 text-band-severe")
      }
    >
      {msg.text}
    </p>
  );
}

export function AccountSettings() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // change-password form
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  // create-admin form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [createMsg, setCreateMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [createBusy, setCreateBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/admins").then((x) => x.json());
    setAdmins(r.admins ?? []);
    setCurrentId(r.currentId ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    setPwBusy(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setPwMsg({ kind: "err", text: data.error ?? "تعذّر تغيير كلمة المرور." });
        return;
      }
      setPwMsg({ kind: "ok", text: "تم تغيير كلمة المرور." });
      setCurPw("");
      setNewPw("");
    } finally {
      setPwBusy(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);
    setCreateBusy(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = (await res.json()) as { admin?: AdminRow; error?: string };
      if (!res.ok || !data.admin) {
        setCreateMsg({ kind: "err", text: data.error ?? "تعذّر إنشاء المشرف." });
        return;
      }
      setCreateMsg({ kind: "ok", text: "تم إنشاء المشرف." });
      setEmail("");
      setName("");
      setPassword("");
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  const toggleActive = async (a: AdminRow) => {
    await fetch(`/api/admin/admins/${a.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    await load();
  };

  const removeAdmin = async (a: AdminRow) => {
    if (!confirm(`حذف المشرف ${a.email}؟`)) return;
    await fetch(`/api/admin/admins/${a.id}`, { method: "DELETE" });
    await load();
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">الإعدادات</h1>
        <a href="/admin" className="btn-ghost">
          رجوع إلى اللوحة
        </a>
      </header>

      {/* Change my password */}
      <section className="card mb-8 p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">تغيير كلمة المرور</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink-soft">كلمة المرور الحالية</label>
            <input
              type="password"
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-soft">
              كلمة المرور الجديدة <span className="text-ink-muted">(8 أحرف على الأقل)</span>
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="field"
            />
          </div>
          <Notice msg={pwMsg} />
          <button type="submit" disabled={pwBusy} className="btn-primary">
            {pwBusy ? "…" : "حفظ"}
          </button>
        </form>
      </section>

      {/* Create admin */}
      <section className="card mb-8 p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">إضافة مشرف جديد</h2>
        <form onSubmit={createAdmin} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-ink-soft">الاسم</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink-soft">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field ltr-nums text-right"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-soft">
              كلمة المرور <span className="text-ink-muted">(8 أحرف على الأقل)</span>
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
          </div>
          <Notice msg={createMsg} />
          <button type="submit" disabled={createBusy} className="btn-primary">
            {createBusy ? "…" : "إنشاء"}
          </button>
        </form>
      </section>

      {/* Admins list */}
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">المشرفون</h2>
        {loading ? (
          <p className="text-sm text-ink-muted">جارٍ التحميل…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-canvas-muted text-right text-xs text-ink-muted">
                  <th className="py-2 font-medium">الاسم</th>
                  <th className="py-2 font-medium">البريد</th>
                  <th className="py-2 font-medium">الحالة</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-b border-canvas-muted/60">
                    <td className="py-2 font-medium text-ink">
                      {a.name}
                      {a.id === currentId && (
                        <span className="mr-2 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] text-brand-dark">
                          أنت
                        </span>
                      )}
                    </td>
                    <td className="ltr-nums py-2 text-ink-soft">{a.email}</td>
                    <td className="py-2">
                      <span
                        className={
                          a.isActive
                            ? "rounded-full bg-band-mid/30 px-2 py-0.5 text-xs text-ink"
                            : "rounded-full bg-canvas-muted px-2 py-0.5 text-xs text-ink-muted"
                        }
                      >
                        {a.isActive ? "مُفعّل" : "معطّل"}
                      </span>
                    </td>
                    <td className="py-2">
                      {a.id !== currentId && (
                        <span className="flex gap-3">
                          <button
                            onClick={() => toggleActive(a)}
                            className="text-xs text-brand-dark hover:underline"
                          >
                            {a.isActive ? "تعطيل" : "تفعيل"}
                          </button>
                          <button
                            onClick={() => removeAdmin(a)}
                            className="text-xs text-band-severe hover:underline"
                          >
                            حذف
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
