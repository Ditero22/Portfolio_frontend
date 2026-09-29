import PortfolioContentManagement from "../../portfolioContent/components/PortfolioContentManagement";
import { resourceGroups } from "@/features/public/resources/data/resources";

const sampleData = resourceGroups.flatMap((group) =>
  group.resources.map((resource) => ({
    title: resource.title,
    subtitle: resource.bestFor ?? resource.label,
    description: resource.description,
    category: group.title,
    url: resource.href,
    published: true,
  })),
);

export default function ResourcesManagement() {
  return (
    <PortfolioContentManagement
      config={{
        kind: "resources",
        title: "Resources",
        singular: "Resource",
        description:
          "Curate useful links and explain what each one is best for.",
        titleLabel: "Resource name",
        subtitleLabel: "Best for",
        descriptionLabel: "Why I recommend it or how I use it",
        categoryLabel: "Collection or topic",
        urlLabel: "Resource link",
        urlRequired: true,
        sampleData,
      }}
    />
  );
}
