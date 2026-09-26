import type { GearSection as GearSectionData } from "../types/gear";
import GearCard from "./GearCard";

export default function GearSection({ section }: { section: GearSectionData }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface/50 p-5 md:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/45">
        {section.eyebrow}
      </p>
      <h2 className="mt-2 text-3xl text-ink">{section.title}</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {section.items.map((item) => (
          <GearCard
            key={item.name}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}
