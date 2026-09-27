import GearSection from "../components/GearSection";
import { gearSections } from "../data/gear";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function GearPage() {
  return (
    <PublicPageFrame
      number="03"
      eyebrow="Personal toolkit"
      title="Gear"
      description="A look at the devices that power my workflow — from my custom desktop and MacBook to the everyday tools I use to create, learn, and get things done."
    >
      <div className="public-page-list">
        {gearSections.map((section) => (
          <GearSection
            key={section.title}
            section={section}
          />
        ))}
      </div>
    </PublicPageFrame>
  );
}
