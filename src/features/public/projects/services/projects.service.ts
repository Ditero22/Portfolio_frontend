import { API_URL } from "@/shared/api";
import type { Project } from "../types/project";

export const projectsChangedEvent = "portfolio-projects-changed";

export function notifyProjectsChanged() {
  window.dispatchEvent(new Event(projectsChangedEvent));
  try {
    localStorage.setItem(
      projectsChangedEvent,
      `${Date.now()}-${Math.random()}`,
    );
  } catch {
    /* Periodic refresh still works when storage is unavailable. */
  }
}

export async function getProjects(signal?: AbortSignal): Promise<Project[]> {
  const response = await fetch(`${API_URL}/projects`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to load projects.");
  return response.json();
}
