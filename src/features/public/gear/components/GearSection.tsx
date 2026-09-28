import type { GearSection as GearSectionData } from "../types/gear";
import GearCard from "./GearCard";

export default function GearSection({
  section,
  index,
}: {
  section: GearSectionData;
  index: number;
}) {
  return (
    <section className="gear-setup-panel">
      <header className="gear-setup-panel__header">
        <span className="gear-setup-panel__index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <p>{section.eyebrow}</p>
          <h2>{section.title}</h2>
        </div>
        <span className="gear-setup-panel__count">
          {String(section.items.length).padStart(2, "0")} devices
        </span>
      </header>
      <div className="gear-setup-panel__grid">
        {section.items.map((item) => (
          <GearCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}
