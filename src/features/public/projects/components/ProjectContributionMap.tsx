import { Code2, HandHelping, Palette, Users, Wrench } from "lucide-react";
import type {
  ProjectContribution,
  ProjectContributionKind,
} from "../types/project";

type ProjectContributionMapProps = {
  contributions: ProjectContribution[];
};

const contributionLabels: Record<ProjectContributionKind, string> = {
  built: "Built",
  designed: "Designed",
  supported: "Supported",
  team: "Team",
};

const contributionIcons = {
  built: Wrench,
  designed: Palette,
  supported: HandHelping,
  team: Users,
} satisfies Record<ProjectContributionKind, typeof Wrench>;

export default function ProjectContributionMap({
  contributions,
}: ProjectContributionMapProps) {
  const personalContributions = contributions.filter(
    (contribution) => contribution.kind !== "team",
  );
  const teamContributions = contributions.filter(
    (contribution) => contribution.kind === "team",
  );

  if (contributions.length === 0) return null;

  const groups = [
    {
      key: "personal",
      title: "My contributions",
      description: "Work I personally completed or supported.",
      items: personalContributions,
    },
    {
      key: "team",
      title: "Team contributions",
      description: "Other areas handled by the project team.",
      items: teamContributions,
    },
  ].filter((group) => group.items.length > 0);

  return (
    <section
      aria-labelledby="project-contribution-map-title"
      className="overflow-hidden rounded-2xl border border-ink/15 bg-surface"
    >
      <header className="flex items-start gap-3 border-b border-ink/10 p-5 sm:p-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-teal-600/20 bg-teal-600/10 text-teal-800 dark:text-teal-200">
          <Code2 size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Work breakdown
          </p>
          <h2
            id="project-contribution-map-title"
            className="mt-1 text-xl text-ink"
          >
            Contribution map
          </h2>
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        {groups.map((group) => (
          <article
            key={group.key}
            className="rounded-xl border border-ink/10 bg-paper/45 p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {group.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-ink/50">
                  {group.description}
                </p>
              </div>
              <span className="rounded-full border border-ink/10 px-2.5 py-1 font-mono text-[10px] text-ink/50">
                {String(group.items.length).padStart(2, "0")}
              </span>
            </div>

            <ul className="space-y-2">
              {group.items.map((contribution, index) => {
                const Icon = contributionIcons[contribution.kind];
                return (
                  <li
                    key={`${contribution.kind}-${index}-${contribution.title}`}
                    className="rounded-lg border border-ink/10 bg-surface p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        size={14}
                        className="shrink-0 text-teal-700 dark:text-teal-300"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-ink/45">
                        {contributionLabels[contribution.kind]}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-medium leading-5 text-ink">
                      {contribution.title}
                    </h4>
                    {contribution.details && (
                      <p className="mt-1.5 text-xs leading-5 text-ink/60">
                        {contribution.details}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
