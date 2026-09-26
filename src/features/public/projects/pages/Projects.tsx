import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import {
  getProjects,
  projectsChangedEvent,
} from "../services/projects.service";
import type { Project } from "../types/project";

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
    }, 5000);
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
    <main className="mx-auto w-full max-w-4xl pb-12  ">
      <header className="relative overflow-hidden rounded-2xl border border-ink/10 bg-surface/70 p-7 md:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-ink/10" />
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-ink/50">
          Selected work
        </p>
        <h1 className="mt-3 text-5xl leading-none text-ink md:text-6xl">
          Projects
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-ink/70">
          A selection of projects where I turn ideas into practical tools and
          keep learning through the process.
        </p>
      </header>
      {error && (
        <p
          role="status"
          className="mt-6 text-sm text-ink/60"
        >
          Projects could not be refreshed. Retrying automatically.
        </p>
      )}
      <div className="mt-6 grid gap-5">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
          />
        ))}
      </div>
    </main>
  );
}
