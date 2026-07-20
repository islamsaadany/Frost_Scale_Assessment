import { DIMENSIONS, DIMENSIONS_BY_ID, type DimensionId } from "@/data/dimensions";

// All 7 dimensions shown together as numbered chips. The active one is
// orange; the rest are faded — so the respondent sees where they are in
// the overall scale as they move between sections.
export function SectionRail({ activeId }: { activeId: DimensionId }) {
  const active = DIMENSIONS_BY_ID[activeId];
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-center gap-1.5">
        {DIMENSIONS.map((d) => {
          const isActive = d.id === activeId;
          return (
            <span
              key={d.id}
              className={
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition " +
                (isActive
                  ? "bg-brand font-bold text-white shadow-sm"
                  : "bg-canvas-muted text-ink-muted")
              }
            >
              <span
                className={
                  "ltr-nums flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold " +
                  (isActive ? "bg-white/25 text-white" : "bg-white text-ink-muted")
                }
              >
                {d.order}
              </span>
              {d.shortName}
            </span>
          );
        })}
      </div>
      <p className="text-center text-[11px] font-medium text-brand-dark">{active.english}</p>
    </div>
  );
}
