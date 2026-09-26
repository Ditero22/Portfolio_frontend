import { API_URL } from "@/shared/api";
import type {
  PortfolioContent,
  PortfolioContentKind,
} from "../types/portfolioContent";

const changedEvent = "portfolio-content-changed";

export function notifyPortfolioContentChanged(kind?: PortfolioContentKind) {
  window.dispatchEvent(new CustomEvent(changedEvent, { detail: { kind } }));
  try {
    localStorage.setItem(changedEvent, `${kind ?? "all"}-${Date.now()}`);
  } catch {
    // Public pages still refresh on their polling interval.
  }
}

export async function getPortfolioContent(
  kind: PortfolioContentKind,
  signal?: AbortSignal,
): Promise<PortfolioContent[]> {
  const response = await fetch(`${API_URL}/${kind}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load this portfolio section.");
  return response.json();
}
