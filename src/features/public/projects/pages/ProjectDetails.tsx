import { ArrowUpRight, Code2, ExternalLink, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NetworkLab from "../components/NetworkLab";
import ProjectContributionMap from "../components/ProjectContributionMap";
import {
  getProjects,
  projectsChangedEvent,
} from "../services/projects.service";
import type { Project } from "../types/project";
import { projectCategories } from "../types/project";
import { getProjectStatusLabel } from "../utils/projectStatus";
import { publicApiRefreshIntervalMs } from "@/shared/api";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function ProjectDetailsPage() {
  const { slug = "" } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let request: AbortController | null = null;

    async function refresh() {
      if (document.visibilityState === "hidden") return;
      request?.abort();
      const controller = new AbortController();
      request = controller;

      try {
        const projects = await getProjects(controller.signal);
        if (active && !controller.signal.aborted) {
          const match = projects.find(
            (candidate) =>
              candidate.slug === slug ||
              (!candidate.slug && candidate.id === slug),
          );
          setProject(
            match && match.published && !match.deletedAt ? match : null,
          );
          setError(false);
        }
      } catch {
        if (active && !controller.signal.aborted) setError(true);
      } finally {
        if (request === controller) {
          request = null;
          if (active) setIsLoading(false);
        }
      }
    }

    function onStorage(event: StorageEvent) {
      if (event.key === projectsChangedEvent) void refresh();
    }

    void refresh();
    const poll = window.setInterval(() => {
      if (!request && document.visibilityState === "visible") void refresh();
    }, publicApiRefreshIntervalMs);
    window.addEventListener(projectsChangedEvent, refresh);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      active = false;
      request?.abort();
      window.clearInterval(poll);
      window.removeEventListener(projectsChangedEvent, refresh);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [slug, attempt]);

  const categoryLabel =
    projectCategories.find((category) => category.value === project?.category)
      ?.label ??
    project?.category ??
    "Project";
  const images = (project?.images ?? []).filter(
    (image) => image && image !== project?.coverImageUrl,
  );

  return (
    <PublicPageFrame
      number="01"
      eyebrow={
        project?.category === "networking" ? "Network lab" : "Case study"
      }
      title={
        project?.title ?? (isLoading ? "Loading project" : "Project not found")
      }
      description={
        project?.description ??
        (isLoading
          ? "Loading project details."
          : "This project is unavailable or may have been removed.")
      }
      className="public-project-details"
    >
      <Link
        to="/projects"
        className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm text-ink/60 transition hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500"
      >
        ← Back to Projects
      </Link>

      {isLoading && <p className="public-content-empty">Loading project…</p>}
      {error && (
        <div
          role="alert"
          className="public-content-empty public-content-empty--error"
        >
          <p>Could not load this project. Retrying automatically.</p>
          <button
            type="button"
            className="w-fit rounded border border-ink/20 px-3 py-2 text-sm transition hover:border-teal-500"
            onClick={() => {
              setError(false);
              setIsLoading(true);
              setAttempt((current) => current + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && project && (
        <article className="space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/75">
              {categoryLabel}
            </span>
            <span className="rounded-full border border-ink/15 px-3 py-1 font-mono text-[10px] text-ink/55">
              {getProjectStatusLabel(project)}
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
            <span className="ml-auto text-xs text-ink/50">
              My role: {project.role}
            </span>
          </div>

          {project.category === "networking" ? (
            <NetworkLab project={project} />
          ) : (
            project.coverImageUrl && (
              <img
                src={project.coverImageUrl}
                alt={`${project.title} project overview`}
                className="max-h-[38rem] w-full rounded-2xl border border-ink/10 bg-surface object-cover"
              />
            )
          )}

          <section className="rounded-2xl border border-ink/15 bg-surface p-5 sm:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
              Project overview
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/70">
              {project.fullDescription || project.description}
            </p>
            {project.highlights.length > 0 &&
              project.category !== "networking" && (
                <ul className="mt-5 space-y-2">
                  {project.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 rounded-lg bg-paper/50 px-3 py-2 text-sm leading-6 text-ink/65"
                    >
                      <ArrowUpRight
                        size={15}
                        className="mt-1 shrink-0 text-teal-700 dark:text-teal-300"
                        aria-hidden="true"
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
          </section>

          <ProjectContributionMap contributions={project.contributions ?? []} />

          <section aria-labelledby="project-stack-title">
            <h2
              id="project-stack-title"
              className="font-mono text-xs uppercase tracking-[0.16em] text-ink/50"
            >
              Technologies and tools
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border border-ink/15 bg-surface px-3 py-2 font-mono text-[10px] text-ink/65"
                >
                  {technology}
                </span>
              ))}
            </div>
          </section>

          {images.length > 0 && (
            <section aria-labelledby="project-gallery-title">
              <h2
                id="project-gallery-title"
                className="font-mono text-xs uppercase tracking-[0.16em] text-ink/50"
              >
                Project gallery
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${project.title} project image ${index + 1}`}
                    loading="lazy"
                    className="aspect-video w-full rounded-xl border border-ink/10 bg-surface object-contain"
                  />
                ))}
              </div>
            </section>
          )}

          {(project.sourceUrl || project.liveUrl) && (
            <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-5">
              {project.sourceUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-4 text-xs text-ink/70 transition hover:border-ink/35 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500"
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
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-xs text-paper transition hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
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
        </article>
      )}
    </PublicPageFrame>
  );
}
