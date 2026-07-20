"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, findInFlightSessionId } from "@/lib/take-storage";

export default function DonePage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const id = findInFlightSessionId();
    if (!id) {
      router.replace("/");
      return;
    }
    setSessionId(id);
    // The session is submitted; clear the in-flight cache so a refresh
    // doesn't drop the user back into the questions.
    clearSession();
  }, [router]);

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
    </div>
  );
}
