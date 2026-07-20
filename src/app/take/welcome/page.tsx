"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOTAL_QUESTIONS } from "@/data/questions";
import { LIKERT_OPTIONS } from "@/data/constants";
import { findInFlightSessionId } from "@/lib/take-storage";

export default function WelcomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!findInFlightSessionId()) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="card space-y-6 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-ink">أهلًا بك</h2>

      <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
        <p>
          يتكوّن هذا المقياس من {TOTAL_QUESTIONS} عبارة تقيس نزعتك نحو الكمالية عبر
          سبعة أبعاد. اقرأ كل عبارة واختر مدى انطباقها عليك بصدق؛ لا توجد إجابة
          صحيحة وأخرى خاطئة.
        </p>
        <p>ستظهر لك عبارة واحدة في كل شاشة، وتُحفظ إجاباتك تلقائيًا.</p>

        <div className="rounded-xl bg-canvas-muted p-4">
          <p className="mb-3 font-medium text-ink">سُلّم الإجابة:</p>
          <ul className="grid grid-cols-1 gap-1 text-ink-soft">
            {LIKERT_OPTIONS.map((o) => (
              <li key={o.value} className="flex items-center gap-2">
                <span className="ltr-nums inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand-dark">
                  {o.value}
                </span>
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={() => router.push("/take/demographics")} className="btn-primary w-full">
        متابعة
      </button>
    </div>
  );
}
