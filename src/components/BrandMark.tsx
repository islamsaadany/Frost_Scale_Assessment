import { SCALE_AUTHOR, SCALE_SUBTITLE, SCALE_TITLE } from "@/data/constants";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="text-center">
      <h1
        className={
          compact
            ? "text-2xl font-extrabold text-brand"
            : "text-4xl font-extrabold text-brand sm:text-5xl"
        }
      >
        {SCALE_TITLE}
      </h1>
      {!compact && (
        <>
          <p className="mt-2 text-sm font-medium text-ink-soft sm:text-base">
            {SCALE_SUBTITLE}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{SCALE_AUTHOR}</p>
        </>
      )}
    </div>
  );
}
