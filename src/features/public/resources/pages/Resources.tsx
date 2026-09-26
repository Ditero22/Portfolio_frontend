import ResourceSection from "../components/ResourceSection";
import { resourceGroups } from "../data/resources";

export default function ResourcesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl pb-12">
      <header className="rounded-2xl border border-ink/10 bg-surface/70 p-7 md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-ink/50">
          Learning shelf
        </p>
        <h1 className="mt-3 text-5xl leading-none text-ink md:text-6xl">
          Resources
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-ink/70">
          A growing collection of the guides, tools, and platforms I use to
          learn, build projects, and improve my workflow.
        </p>
      </header>
      <div className="mt-6 space-y-6">
        {resourceGroups.map((group) => (
          <ResourceSection
            key={group.title}
            group={group}
          />
        ))}
      </div>
    </main>
  );
}
