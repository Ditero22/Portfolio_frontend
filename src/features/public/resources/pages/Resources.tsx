import ResourceSection from "../components/ResourceSection";
import { resourceGroups } from "../data/resources";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function ResourcesPage() {
  return (
    <PublicPageFrame
      number="04"
      eyebrow="Learning shelf"
      title="Resources"
      description="A growing collection of the guides, tools, and platforms I use to learn, build projects, and improve my workflow."
    >
      <div className="public-page-list">
        {resourceGroups.map((group) => (
          <ResourceSection
            key={group.title}
            group={group}
          />
        ))}
      </div>
    </PublicPageFrame>
  );
}
