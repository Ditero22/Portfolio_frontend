import type { PortfolioContent } from "../../portfolioContent/types/portfolioContent";
import type { ResourceGroup } from "../types/resource";

export function groupManagedResources(items: PortfolioContent[]): ResourceGroup[] {
  const groups = new Map<string, ResourceGroup>();

  for (const item of items) {
    if (!item.url) continue;

    const groupTitle = item.category?.trim() || "Other";
    let group = groups.get(groupTitle);

    if (!group) {
      group = {
        title: groupTitle,
        description: "Curated links and references.",
        resources: [],
      };
      groups.set(groupTitle, group);
    }

    group.resources.push({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      href: item.url,
      label: "",
      bestFor: item.subtitle ?? undefined,
    });
  }

  return Array.from(groups.values());
}
