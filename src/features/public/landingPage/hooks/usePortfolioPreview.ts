import { useEffect, useState } from "react";
import {
  getProjects,
  projectsChangedEvent,
} from "../../projects/services/projects.service";
import {
  getExperience,
  experienceChangedEvent,
} from "../../experience/services/experience.service";
import type { Project } from "../../projects/types/project";
import type { Experience } from "../../experience/types/experience";

export function usePortfolioPreview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState({
    projects: false,
    experience: false,
  });
  useEffect(() => {
    let request: AbortController | null = null;
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const [work, roles] = await Promise.allSettled([
        getProjects(controller.signal),
        getExperience(controller.signal),
      ]);
      if (!controller.signal.aborted) {
        if (work.status === "fulfilled")
          setProjects(
            work.value.filter((item) => item.published && !item.deletedAt),
          );
        if (roles.status === "fulfilled")
          setExperience(
            roles.value.filter((item) => item.published && !item.deletedAt),
          );
        setUnavailable({
          projects: work.status === "rejected",
          experience: roles.status === "rejected",
        });
        setLoading(false);
      }
      if (request === controller) request = null;
    }
    const update = () => {
      void refresh();
    };
    const storage = (event: StorageEvent) => {
      if (
        [projectsChangedEvent, experienceChangedEvent].includes(event.key ?? "")
      )
        update();
    };
    update();
    const timer = window.setInterval(() => {
      if (!request) update();
    }, 5000);
    window.addEventListener(projectsChangedEvent, update);
    window.addEventListener(experienceChangedEvent, update);
    window.addEventListener("storage", storage);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      request?.abort();
      window.clearInterval(timer);
      window.removeEventListener(projectsChangedEvent, update);
      window.removeEventListener(experienceChangedEvent, update);
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return { projects, experience, loading, unavailable };
}
