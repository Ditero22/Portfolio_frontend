import { ArrowUpRight, Code2, ExternalLink, Star } from "lucide-react";
import type { Project } from "../types/project";

const categoryLabels: Record<string, string> = {
  web: "Web",
  mobile: "Mobile",
  networking: "Networking",
  software: "Software",
  other: "Other",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
};

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const category = project.category ?? "web";
  const gallery = (project.images ?? []).filter(
    (image) => image && image !== project.coverImageUrl,
  );

  return (
    <article className="project-border-light design-card overflow-hidden rounded-2xl border border-ink/15 bg-surface">
      {project.coverImageUrl && (
        <figure className="relative overflow-hidden border-b border-ink/10 bg-ink/5">
          <img
            src={project.coverImageUrl}
            alt={
              category === "networking"
                ? `${project.title} network topology`
                : `${project.title} project cover`
            }
            loading="lazy"
            className={`max-h-[30rem] w-full object-cover ${category === "networking" ? "object-contain p-4" : ""}`}
          />
          {category === "networking" && (
            <figcaption className="absolute bottom-3 left-3 rounded-full border border-ink/10 bg-surface/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/65 backdrop-blur">
              Network topology
            </figcaption>
          )}
        </figure>
      )}
      <div className="md:grid md:grid-cols-[8rem_1fr]">
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
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/75">
              {categoryLabels[category] ?? category}
            </span>
            <span className="rounded-full border border-ink/15 px-3 py-1 font-mono text-[10px] text-ink/55">
              {statusLabels[project.status ?? "completed"] ?? project.status}
            </span>
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 font-mono text-[10px] text-amber-700 dark:text-amber-300">
                <Star
                  size={11}
                  aria-hidden="true"
                />
                Featured
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl text-ink">{project.title}</h2>
            <span className="rounded-full border border-ink/15 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/55">
              {project.role}
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/70">
            {project.description}
          </p>
          {project.fullDescription && (
            <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-ink/60">
              {project.fullDescription}
            </p>
          )}
          {project.highlights.length > 0 && (
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
          )}
          {gallery.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((image, imageIndex) => (
                <img
                  key={`${image}-${imageIndex}`}
                  src={image}
                  alt={`${project.title} project image ${imageIndex + 1}`}
                  loading="lazy"
                  className="aspect-video w-full rounded-lg border border-ink/10 bg-paper object-cover"
                />
              ))}
            </div>
          )}
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
          {(project.sourceUrl || project.liveUrl) && (
            <div className="mt-5 flex flex-wrap gap-3">
              {project.sourceUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/15 px-4 text-xs text-ink/70 transition hover:border-ink/35 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500"
                >
                  <Code2
                    size={15}
                    aria-hidden="true"
                  />
                  Source code
                  <ExternalLink
                    size={12}
                    aria-hidden="true"
                  />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-xs text-paper transition hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  Live demo
                  <ExternalLink
                    size={12}
                    aria-hidden="true"
                  />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
