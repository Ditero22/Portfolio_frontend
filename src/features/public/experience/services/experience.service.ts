import { API_URL } from "@/shared/api";
import type { Experience } from "../types/experience";

export const experienceChangedEvent = "portfolio-experience-changed";

export function notifyExperienceChanged() {
  window.dispatchEvent(new Event(experienceChangedEvent));
  try {
    localStorage.setItem(
      experienceChangedEvent,
      `${Date.now()}-${Math.random()}`,
    );
  } catch {
    /* Periodic refresh still works when storage is unavailable. */
  }
}

export async function getExperience(
  signal?: AbortSignal,
): Promise<Experience[]> {
  const response = await fetch(`${API_URL}/experience`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to load experience.");
  return response.json();
}
