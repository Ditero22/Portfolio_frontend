import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import {
  getProjects,
  projectsChangedEvent,
} from "../services/projects.service";
import type { Project } from "../types/project";
import { projectCategories } from "../types/project";
import { filterProjectsByCategory } from "../utils/filterProjects.js";
import { publicApiRefreshIntervalMs } from "@/shared/api";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let active = true;
    let request: AbortController | null = null;
    let refreshQueued = false;

    async function refresh() {
      if (document.visibilityState === "hidden") return;

      if (request) {
        refreshQueued = true;
        return;
      }

      const controller = new AbortController();
      request = controller;

      try {
        const data = await getProjects(controller.signal);
        if (active && !controller.signal.aborted) {
          setProjects(
            data.filter((project) => project.published && !project.deletedAt),
          );
          setError(false);
        }
      } catch {
        if (active && !controller.signal.aborted) setError(true);
      } finally {
        if (request === controller) {
          request = null;
          if (active) setIsLoading(false);
          if (active && refreshQueued) {
            refreshQueued = false;
            void refresh();
          }
        }
      }
    }

    const onChange = () => {
      void refresh();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === projectsChangedEvent) onChange();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") onChange();
    };

    onChange();
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") onChange();
    }, publicApiRefreshIntervalMs);
    window.addEventListener(projectsChangedEvent, onChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      request?.abort();
      window.clearInterval(poll);
      window.removeEventListener(projectsChangedEvent, onChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [attempt]);

  const filteredProjects = filterProjectsByCategory(projects, category);
  const selectedCategoryLabel =
    projectCategories.find((item) => item.value === category)?.label ??
    "selected category";

  return (
    <PublicPageFrame
      number="01"
      eyebrow="Selected work"
      title="Projects"
      description="A selection of projects where I turn ideas into practical tools and keep learning through the process."
    >
      {error && (
        <div className="public-page-notice flex flex-wrap items-center justify-between gap-3" role="alert">
          <p>
            {projects.length > 0
              ? "Projects could not be refreshed. Showing the last loaded version."
              : "Projects could not be loaded. Check your connection and try again."}
          </p>
          <button
            type="button"
            onClick={() => {
              setError(false);
              setIsLoading(true);
              setAttempt((current) => current + 1);
            }}
            className="min-h-10 rounded-full border border-ink/20 px-4 text-xs font-medium transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          >
            Retry
          </button>
        </div>
      )}
      <div
        role="group"
        aria-label="Filter projects by category"
        className="mb-7 flex flex-wrap gap-2"
      >
        {[{ value: "all", label: "All" }, ...projectCategories].map(
          (option) => {
            const active = category === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(option.value)}
                className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-surface text-ink/65 hover:border-ink/35 hover:text-ink"}`}
              >
                {option.label}
                <span className="ml-2 font-mono text-[10px] opacity-60">
                  {option.value === "all"
                    ? projects.length
                    : filterProjectsByCategory(projects, option.value).length}
                </span>
              </button>
            );
          },
        )}
      </div>
      {isLoading && projects.length === 0 ? (
        <p
          className="public-content-empty"
          role="status"
          aria-live="polite"
        >
          Loading projects…
        </p>
      ) : error && projects.length === 0 ? (
        null
      ) : filteredProjects.length > 0 ? (
        <div className="project-list-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      ) : (
        <div className="public-content-empty text-center">
          <p>
            {category === "all"
              ? "No published projects yet. Check back soon."
              : `No projects are listed under ${selectedCategoryLabel} yet.`}
          </p>
          {category !== "all" && (
            <button
              type="button"
              onClick={() => setCategory("all")}
              className="mx-auto mt-2 min-h-11 rounded-full border border-ink/15 px-4 text-xs font-medium text-ink/70 transition-colors hover:border-teal-500/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              Show all projects
            </button>
          )}
        </div>
      )}
    </PublicPageFrame>
  );
}
