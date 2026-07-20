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
    <div className="inline-flex flex-col items-center rounded-2xl bg-brand px-5 py-2 text-center shadow-sm">
      <span className="text-sm font-extrabold leading-tight text-white sm:text-base">{arabic}</span>
      {english && <span className="text-[11px] font-medium text-white/85">{english}</span>}
    </div>
  );
}
