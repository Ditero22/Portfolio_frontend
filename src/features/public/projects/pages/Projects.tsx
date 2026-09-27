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
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let active = true;
    let request: AbortController | null = null;
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      request?.abort();
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
        if (request === controller) request = null;
      }
    }
    const onChange = () => {
      void refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === projectsChangedEvent) onChange();
    };
    onChange();
    const poll = window.setInterval(() => {
      if (!request) onChange();
    }, publicApiRefreshIntervalMs);
    window.addEventListener(projectsChangedEvent, onChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onChange);
    return () => {
      active = false;
      request?.abort();
      window.clearInterval(poll);
      window.removeEventListener(projectsChangedEvent, onChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, []);

  const filteredProjects = filterProjectsByCategory(projects, category);

  return (
    <PublicPageFrame
      number="01"
      eyebrow="Selected work"
      title="Projects"
      description="A selection of projects where I turn ideas into practical tools and keep learning through the process."
    >
      {error && (
        <p
          role="status"
          className="public-page-notice"
        >
          Projects could not be refreshed. Retrying automatically.
        </p>
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
                className={`rounded-full border px-4 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-surface text-ink/65 hover:border-ink/35 hover:text-ink"}`}
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
      <div className="public-page-list">
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
          />
        ))}
        {filteredProjects.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/20 px-5 py-10 text-center text-sm text-ink/55">
            No projects in this category yet.
          </p>
        )}
      </div>
    </PublicPageFrame>
  );
}
