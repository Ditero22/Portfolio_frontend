import { API_URL } from "@/shared/api";

export interface HiringStatus {
  isHired: boolean;
}

const changedEvent = "portfolio-hiring-status-changed";

export function notifyHiringStatusChanged() {
  window.dispatchEvent(new Event(changedEvent));
  try {
    localStorage.setItem(changedEvent, String(Date.now()));
  } catch {
    // The public status still refreshes periodically if browser storage is off.
  }
}

export async function getHiringStatus(signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/settings/hiring`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load hiring status.");
  return (await response.json()) as HiringStatus;
}
