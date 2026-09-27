import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import {
  getProjects,
  projectsChangedEvent,
} from "../services/projects.service";
import type { Project } from "../types/project";
import { publicApiRefreshIntervalMs } from "@/shared/api";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState(false);

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
      <div className="public-page-list">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
          />
        ))}
      </div>
    </PublicPageFrame>
  );
}
