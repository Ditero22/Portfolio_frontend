import { API_URL, apiFetch, apiResponseError } from "@/shared/api";
import type { PublicResume } from "../types/resume";

export const resumeChangedEvent = "portfolio-resume-changed";

export function notifyResumeChanged() {
  window.dispatchEvent(new Event(resumeChangedEvent));
  try {
    localStorage.setItem(resumeChangedEvent, String(Date.now()));
  } catch {
    // The public link refreshes whenever the page is opened again.
  }
}

export async function getPublicResume(signal?: AbortSignal) {
  const response = await apiFetch(`${API_URL}/resume/current`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw await apiResponseError(response, "Could not load the current resume.");
  return (await response.json()) as PublicResume | null;
}
