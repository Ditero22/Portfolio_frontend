import { API_URL, apiFetch, apiResponseError } from "@/shared/api";
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
  const response = await apiFetch(`${API_URL}/experience`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw await apiResponseError(response, "Failed to load experience.");
  return response.json();
}
