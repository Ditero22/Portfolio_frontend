import { publicApiRefreshIntervalMs } from "@/shared/api";

export const blogChangedEvent = "portfolio-blog-changed";

export function notifyBlogChanged() {
  window.dispatchEvent(new Event(blogChangedEvent));
  try {
    localStorage.setItem(blogChangedEvent, `${Date.now()}-${Math.random()}`);
  } catch {
    // Polling still refreshes the page when browser storage is unavailable.
  }
}

export function watchBlogUpdates(
  refresh: (signal: AbortSignal) => Promise<void>,
) {
  let request: AbortController | null = null;
  async function run() {
    if (document.visibilityState === "hidden") return;
    request?.abort();
    const controller = new AbortController();
    request = controller;
    try {
      await refresh(controller.signal);
    } finally {
      if (request === controller) request = null;
    }
  }
  const onChange = () => {
    void run();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === blogChangedEvent) onChange();
  };
  onChange();
  const timer = window.setInterval(() => {
    if (!request) onChange();
  }, publicApiRefreshIntervalMs);
  window.addEventListener(blogChangedEvent, onChange);
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    request?.abort();
    window.clearInterval(timer);
    window.removeEventListener(blogChangedEvent, onChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}
