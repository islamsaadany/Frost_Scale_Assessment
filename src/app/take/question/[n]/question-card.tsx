"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LIKERT_OPTIONS } from "@/data/constants";
import { DimensionPill } from "@/components/DimensionPill";
import {
  findInFlightSessionId,
  loadCachedAnswers,
  saveCachedAnswers,
  updateCachedAnswer,
  type CachedAnswers,
} from "@/lib/take-storage";

interface QuestionCardProps {
  position: number;
  total: number;
  dimArabic: string;
  dimEnglish: string;
  questionId: number;
  questionText: string;
}

export function QuestionCard({
  position,
  total,
  dimArabic,
  dimEnglish,
  questionId,
  questionText,
}: QuestionCardProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const advancingRef = useRef(false);

  // Resolve the session + the answer for THIS question from the local
  // cache; fall back to a one-time fetch if the cache is cold.
  useEffect(() => {
    const id = findInFlightSessionId();
    if (!id) {
      setLoadError("تعذّر إيجاد جلستك. يرجى إعادة إدخال رمز الدخول.");
      setLoading(false);
      return;
    }
    setSessionId(id);

    const apply = (cache: CachedAnswers) => {
      setSelected(cache[questionId] ?? null);
      setLoading(false);
    };

    const cached = loadCachedAnswers(id);
    if (cached) {
      apply(cached);
      return;
    }

    let cancelled = false;
    fetch(`/api/sessions/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch_failed");
        return (await res.json()) as {
          session: { submittedAt: string | null };
          answersByQuestionId: Record<number, number>;
        };
      })
      .then((data) => {
        if (cancelled) return;
        if (data.session.submittedAt) {
          router.push("/take/done");
          return;
        }
        saveCachedAnswers(id, data.answersByQuestionId);
        apply(data.answersByQuestionId);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("تعذّر تحميل جلستك. يرجى إعادة إدخال رمز الدخول.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [questionId, router]);

  // Prefetch neighbours for instant navigation.
  useEffect(() => {
    if (loading || loadError) return;
    if (position < total) router.prefetch(`/take/question/${position + 1}`);
    if (position > 1) router.prefetch(`/take/question/${position - 1}`);
    if (position >= total) router.prefetch("/take/done");
  }, [position, total, loading, loadError, router]);

  const persistInBackground = (sid: string, value: number) => {
    updateCachedAnswer(sid, questionId, value);
    fetch(`/api/sessions/${sid}/responses`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers: [{ questionId, value }] }),
    }).catch(() => {
      // Swallow — the final flush re-sends the full answer set.
    });
  };

  const flushAndSubmit = useCallback(
    async (sid: string) => {
      const cache = loadCachedAnswers(sid) ?? {};
      const answers = Object.entries(cache).map(([qid, value]) => ({
        questionId: Number(qid),
        value,
      }));
      if (answers.length > 0) {
        const flush = await fetch(`/api/sessions/${sid}/responses`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (!flush.ok) {
          setLoadError("تعذّر حفظ إجاباتك. تحقق من اتصالك وحاول مجددًا.");
          setSubmitting(false);
          advancingRef.current = false;
          return;
        }
      }
      const res = await fetch(`/api/sessions/${sid}/submit`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setLoadError(body?.error ?? "تعذّر إرسال إجاباتك.");
        setSubmitting(false);
        advancingRef.current = false;
        return;
      }
      router.push("/take/done");
    },
    [router],
  );

  const onSelect = useCallback(
    (value: number) => {
      if (!sessionId || advancingRef.current) return;
      advancingRef.current = true;
      setSelected(value);
      persistInBackground(sessionId, value);

      if (position >= total) {
        setSubmitting(true);
        void flushAndSubmit(sessionId);
        return;
      }
      router.push(`/take/question/${position + 1}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, position, total, flushAndSubmit, router, questionId],
  );

  const onBack = () => {
    if (submitting) return;
    if (position <= 1) router.push("/take/demographics");
    else router.push(`/take/question/${position - 1}`);
  };

  // Reset the navigation guard when the question changes.
  useEffect(() => {
    advancingRef.current = false;
  }, [questionId]);

  // Keyboard: 1..5 selects.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (loading || loadError) return;
      if (e.key >= "1" && e.key <= "5") onSelect(Number(e.key));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loading, loadError, onSelect]);

  if (loading) return <p className="text-sm text-ink-muted">جارٍ التحميل…</p>;
  if (loadError) {
    return (
      <div className="card space-y-4 p-6 text-center">
        <p className="text-sm text-band-severe">{loadError}</p>
        <button onClick={() => router.push("/")} className="btn-ghost">
          العودة إلى البداية
        </button>
      </div>
    );
  }

  const progressPct = Math.round((position / total) * 100);

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-muted">
          <span className="ltr-nums">
            السؤال {position} من {total}
          </span>
          <span className="ltr-nums">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-canvas-muted">
          <div className="h-full bg-brand transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex justify-center">
        <DimensionPill arabic={dimArabic} english={dimEnglish} />
      </div>

      <h2 className="min-h-[4.5rem] text-center text-2xl font-bold leading-relaxed text-ink sm:text-3xl">
        {questionText}
      </h2>

      {/* Likert — bubble row like the booklet. Value 1 sits on the right (RTL). */}
      <div className="flex justify-between gap-1 sm:gap-2">
        {LIKERT_OPTIONS.map((o) => {
          const active = selected === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onSelect(o.value)}
              disabled={submitting}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl px-1 py-3 transition hover:bg-canvas-muted disabled:opacity-60"
            >
              <span
                className={[
                  "ltr-nums flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition sm:h-12 sm:w-12",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-brand-soft bg-white text-brand-dark",
                ].join(" ")}
              >
                {o.value}
              </span>
              <span
                className={[
                  "text-center text-[10px] leading-tight sm:text-xs",
                  active ? "font-bold text-ink" : "text-ink-muted",
                ].join(" ")}
              >
                {o.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} disabled={submitting || position <= 1} className="btn-ghost disabled:opacity-40">
          السابق
        </button>
        {submitting && <span className="text-sm text-ink-muted">جارٍ إرسال إجاباتك…</span>}
      </div>
    </div>
  );
}
