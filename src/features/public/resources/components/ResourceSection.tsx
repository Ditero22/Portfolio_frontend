import type { ResourceGroup } from "../types/resource";
import ResourceCard from "./ResourceCard";

export default function ResourceSection({ group }: { group: ResourceGroup }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface/50 p-5 md:p-7">
      <h2 className="text-3xl text-ink">{group.title}</h2>
      <p className="mt-1 text-sm text-ink/60">{group.description}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {group.resources.map((resource) => (
          <ResourceCard
            key={resource.title}
            resource={resource}
          />
        ))}
      </div>
    </section>
  );
}
