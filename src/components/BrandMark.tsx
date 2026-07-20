import { SCALE_AUTHOR, SCALE_SUBTITLE, SCALE_TITLE } from "@/data/constants";

/* eslint-disable @next/next/no-img-element */

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/frost-logo.png"
      alt="شعار مقياس فروست"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: "auto" }}
    />
  );
}

/**
 * The interior-page header used on take/report screens: orange wordmark
 * (with the booklet's underline) + subtitle on the right, logo on the left.
 */
export function PageHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="inline-block border-b-2 border-brand pb-1 text-xl font-extrabold text-brand sm:text-2xl">
          {SCALE_TITLE}
        </h1>
        <p className="mt-1 text-[11px] font-bold text-brand-dark sm:text-xs">{SCALE_SUBTITLE}</p>
      </div>
      <Logo size={44} />
    </div>
  );
}

/** Centered lockup for the landing cover. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  if (compact) return <PageHeader />;
  return (
    <div className="text-center">
      <h1 className="text-4xl font-extrabold text-brand sm:text-5xl">{SCALE_TITLE}</h1>
      <p className="mt-3 text-sm font-medium text-ink-soft sm:text-base">{SCALE_SUBTITLE}</p>
      <p className="mt-1 text-xs text-ink-muted">{SCALE_AUTHOR}</p>
    </div>
  );
}
