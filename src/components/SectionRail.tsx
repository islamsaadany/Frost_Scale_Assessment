import { DIMENSIONS, DIMENSIONS_BY_ID, type DimensionId } from "@/data/dimensions";
import { DimensionPill } from "@/components/DimensionPill";

// Compact section indicator: the current dimension shows as a full orange
// pill (Arabic + English); the other six appear as small numbered dots —
// tinted for the ones already passed, faded for the ones still ahead.
export function SectionRail({ activeId }: { activeId: DimensionId }) {
  const activeOrder = DIMENSIONS_BY_ID[activeId].order;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {DIMENSIONS.map((d) => {
        if (d.id === activeId) {
          return <DimensionPill key={d.id} arabic={d.shortName} english={d.english} />;
        }
        const done = d.order < activeOrder;
        return (
          <span
            key={d.id}
            title={d.shortName}
            className={
              "ltr-nums flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition " +
              (done ? "bg-brand/15 text-brand-dark" : "bg-canvas-muted text-ink-muted")
            }
          >
            {d.order}
          </span>
        );
      })}
    </div>
  );
}
