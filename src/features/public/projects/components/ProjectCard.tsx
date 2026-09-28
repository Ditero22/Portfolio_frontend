import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  ImageOff,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../types/project";
import { getProjectStatusLabel } from "../utils/projectStatus";

const categoryLabels: Record<string, string> = {
  web: "Web",
  mobile: "Mobile",
  networking: "Networking",
  software: "Software",
  other: "Other",
};

export default function ProjectCard({ project }: { project: Project }) {
  const category = project.category ?? "web";
  const categoryLabel = categoryLabels[category] ?? category;
  const projectUrl = `/projects/${encodeURIComponent(project.slug ?? project.id)}`;
  const stack = Array.isArray(project.stack) ? project.stack : [];
  const visibleStack = stack.slice(0, 4);
  const remainingStackCount = Math.max(0, stack.length - visibleStack.length);
  const summary =
    project.description?.trim() || "Project details are coming soon.";
  const sourceUrl = safeExternalUrl(project.sourceUrl);
  const liveUrl = safeExternalUrl(project.liveUrl);

  return (
    <article className="project-border-light project-list-card design-card group relative flex min-w-0 flex-col rounded-2xl border border-ink/15 bg-surface">
      <Link
        to={projectUrl}
        aria-label={`View ${project.title || "project"} details`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
      >
        <span className="sr-only">Open project details</span>
      </Link>
      <ProjectMedia
        key={project.coverImageUrl ?? "no-cover"}
        project={project}
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-teal-500/25 bg-teal-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/75">
            {categoryLabel}
          </span>
          <span className="rounded-full border border-ink/15 px-2.5 py-1 font-mono text-[10px] text-ink/55">
            {getProjectStatusLabel(project)}
          </span>
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] text-amber-700 dark:text-amber-300">
              <Star
                size={11}
                aria-hidden="true"
              />
              Featured
            </span>
          )}
        </div>

        <div className="flex min-w-0 items-start justify-between gap-3">
          <h2 className="line-clamp-2 min-w-0 text-2xl leading-tight text-ink">
            {project.title || "Untitled project"}
          </h2>
          {project.role?.trim() && (
            <span className="max-w-[42%] shrink-0 truncate rounded-full border border-ink/15 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-ink/55">
              {project.role}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/65">
          {summary}
        </p>

        <div className="mt-auto pt-4">
          {stack.length > 0 && (
            <ul
              aria-label="Technologies"
              className="flex flex-wrap gap-1.5"
            >
              {visibleStack.map((item, itemIndex) => (
                <li
                  key={`${item}-${itemIndex}`}
                  className="max-w-full truncate rounded-full border border-ink/10 bg-paper/50 px-2.5 py-1 font-mono text-[10px] text-ink/60"
                >
                  {item}
                </li>
              ))}
              {remainingStackCount > 0 && (
                <li className="rounded-full border border-ink/10 px-2.5 py-1 font-mono text-[10px] text-ink/50">
                  +{remainingStackCount}
                </li>
              )}
            </ul>
          )}

          <div className="mt-3 flex min-h-10 items-center justify-between gap-3 border-t border-ink/10 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/65 transition-colors group-hover:text-teal-700 dark:group-hover:text-teal-300">
              View project
              <ArrowUpRight
                size={14}
                aria-hidden="true"
              />
            </span>
            <div className="relative z-20 flex shrink-0 items-center gap-1">
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Source code for ${project.title}`}
                  title="Source code"
                  className="grid h-10 w-10 place-items-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  <Code2
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              )}
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Live demo for ${project.title}`}
                  title="Live demo"
                  className="grid h-10 w-10 place-items-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  <ExternalLink
                    size={15}
                    aria-hidden="true"
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectMedia({ project }: { project: Project }) {
  const [hasImageError, setHasImageError] = useState(false);
  const category = project.category ?? "web";
  const imageUrl = safeExternalUrl(project.coverImageUrl);

  return (
    <div
      className={`project-list-card__media relative overflow-hidden border-b border-ink/10 bg-linear-to-br from-teal-500/10 via-ink/5 to-transparent ${category === "networking" ? "aspect-[16/8] sm:aspect-[16/7]" : "aspect-[16/6] sm:aspect-[16/5]"}`}
    >
      {imageUrl && !hasImageError ? (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setHasImageError(true)}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none ${category === "networking" ? "object-contain p-4" : "object-cover"}`}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-ink/40">
          {hasImageError ? (
            <ImageOff
              size={25}
              strokeWidth={1.4}
              aria-hidden="true"
            />
          ) : (
            <Code2
              size={27}
              strokeWidth={1.4}
              aria-hidden="true"
            />
          )}
          <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
            {hasImageError ? "Preview unavailable" : "Project preview"}
          </span>
        </div>
      )}
      {category === "networking" && imageUrl && !hasImageError && (
        <span className="absolute bottom-2.5 left-2.5 rounded-full border border-ink/10 bg-surface/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-ink/65 backdrop-blur">
          Network topology
        </span>
      )}
    </div>
  );
}

function safeExternalUrl(value: string | null | undefined) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
