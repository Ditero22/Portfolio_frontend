import { useState } from "react";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../../projects/types/project";

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const centerIndex = projects.length === 3 ? 1 : 0;
  const [slots, setSlots] = useState(() =>
    projects.map((project) => project.id),
  );
  const centeredId = slots[centerIndex];

  function selectProject(id: string) {
    setSlots((current) => {
      const index = current.indexOf(id);
      if (index < 0 || index === centerIndex) return current;
      const next = [...current];
      [next[index], next[centerIndex]] = [next[centerIndex], next[index]];
      return next;
    });
  }

  return (
    <div
      className={`project-fan ${projects.length === 3 ? "project-fan--layered" : ""}`}
      aria-label="Featured projects"
    >
      {projects.map((project, index) => {
        const active = project.id === centeredId;
        return (
          <article
            key={project.id}
            data-slot={slots.indexOf(project.id)}
            data-active={active}
            className={`project-fan-card group relative flex flex-col overflow-hidden rounded-2xl border border-ink/15 bg-surface p-6 text-ink shadow-xl shadow-black/10 ${active ? "project-border-light" : ""}`}
          >
            {!active && (
              <button
                type="button"
                onClick={() => selectProject(project.id)}
                aria-label={`Show ${project.title} in the center`}
                className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-teal-500"
              />
            )}
            <div className="mb-7 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 font-mono text-[9px] uppercase tracking-wider">
                  {project.category ?? "web"}
                </span>
                <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-ink/50">
                  {project.role}
                </span>
              </div>
              <span className="font-mono text-xs text-ink/35">
                0{index + 1}
              </span>
            </div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/10 bg-ink/5">
              <Code2
                size={24}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-3xl leading-tight">{project.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/60">
              {project.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.stack.slice(0, 3).map((stack) => (
                <span
                  key={stack}
                  className="rounded border border-ink/10 px-2 py-1 text-[10px] text-ink/60"
                >
                  {stack}
                </span>
              ))}
            </div>
            <div className="mt-auto min-h-16 pt-4">
              {active && (
                <Link
                  to="/projects"
                  className="flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/70 focus-visible:outline-2 focus-visible:outline-teal-500"
                >
                  <span>Explore project</span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </article>
        );
      })}
      <p
        className="sr-only"
        aria-live="polite"
      >
        Selected project:{" "}
        {projects.find((project) => project.id === centeredId)?.title}
      </p>
    </div>
  );
}
