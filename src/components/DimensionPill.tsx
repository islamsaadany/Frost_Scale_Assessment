// The booklet's dimension header: an orange rounded pill with the Arabic
// name (bold, white) and the English name beneath it (smaller).
export function DimensionPill({
  arabic,
  english,
}: {
  arabic: string;
  english?: string;
}) {
  return (
    <div className="inline-flex flex-col items-center rounded-2xl bg-brand px-3 py-1 text-center shadow-sm sm:px-5 sm:py-2">
      <span className="text-xs font-extrabold leading-tight text-white sm:text-base">{arabic}</span>
      {/* English subtitle only on wider screens, so the mobile pill stays
          narrow enough for the whole rail to fit on one line. */}
      {english && (
        <span className="hidden text-[11px] font-medium text-white/85 sm:block">{english}</span>
      )}
    </div>
  );
}
