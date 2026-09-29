import { useCallback, useEffect, useState } from "react";

import { getPortfolioContent } from "../../portfolioContent/services/portfolioContent.service";
import type { PortfolioContent } from "../../portfolioContent/types/portfolioContent";
import { publicApiRefreshIntervalMs } from "@/shared/api";
import { resourceGroups } from "../data/resources";
import type { ResourceGroup } from "../types/resource";
import { groupManagedResources } from "../utils/resourceContent";

export function useResources() {
  const [groups, setGroups] = useState<ResourceGroup[]>(resourceGroups);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usingFallback, setUsingFallback] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const items: PortfolioContent[] = await getPortfolioContent(
        "resources",
        signal,
      );
      if (signal?.aborted) return;

      setGroups(groupManagedResources(items));
      setUsingFallback(false);
      setError(false);
    } catch {
      if (!signal?.aborted) setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refresh(controller.signal));

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, publicApiRefreshIntervalMs);
    const onContentChanged = (event: Event) => {
      const kind = (event as CustomEvent<{ kind?: string }>).detail?.kind;
      if (!kind || kind === "resources") void refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "portfolio-content-changed") void refresh();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("portfolio-content-changed", onContentChanged);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener(
        "portfolio-content-changed",
        onContentChanged,
      );
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);

  return { groups, loading, error, usingFallback };
}
