import ResourceLibrary from "../components/ResourceLibrary";
import { resourceGroups } from "../data/resources";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function ResourcesPage() {
  return (
    <PublicPageFrame
      number="04"
      eyebrow="Reference library"
      title="Resources"
      description="A practical library of documentation, learning platforms, and tools I return to while building and studying. Search by topic or browse a collection."
    >
      <ResourceLibrary groups={resourceGroups} />
    </PublicPageFrame>
  );
}
