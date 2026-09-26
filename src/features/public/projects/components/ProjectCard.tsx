import { Code2, ArrowUpRight } from "lucide-react";
import type { Project } from "../types/project";
export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <article className="project-border-light design-card overflow-hidden rounded-2xl border border-ink/15 bg-surface md:grid md:grid-cols-[8rem_1fr]">
      <div className="relative flex min-h-24 items-center justify-between gap-4 border-b border-ink/10 bg-linear-to-br from-teal-500/10 to-transparent p-5 md:flex-col md:items-start md:border-b-0 md:border-r">
        <Code2
          size={30}
          strokeWidth={1.25}
          className="text-ink/60"
          aria-hidden="true"
        />
        <span className="font-mono text-4xl text-ink/20">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl text-ink">{project.title}</h2>
          <span className="rounded-full border border-ink/15 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/55">
            {project.role}
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70">
          {project.description}
        </p>
        <ul className="mt-5 space-y-2 text-sm text-ink/65">
          {project.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-3 rounded-lg bg-paper/50 px-3 py-2"
            >
              <ArrowUpRight
                size={15}
                className="mt-1 shrink-0 text-ink/40"
                aria-hidden="true"
              />
              {highlight}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-ink/10 pt-5">
          {project.stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-ink/15 px-3 py-1 font-mono text-[10px] text-ink/60"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
