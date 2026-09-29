import { useEffect, useState } from "react";

import { getPortfolioContent } from "../../portfolioContent/services/portfolioContent.service";
import type {
  PortfolioContent,
  PortfolioContentKind,
} from "../../portfolioContent/types/portfolioContent";

type LandingPreviewKind = Exclude<PortfolioContentKind, "resources">;

const contentKinds: LandingPreviewKind[] = [
  "stack",
  "certifications",
  "recommendations",
  "skills",
];

interface PreviewSectionState {
  items: PortfolioContent[];
  loading: boolean;
  unavailable: boolean;
}

type PreviewContentState = Record<LandingPreviewKind, PreviewSectionState>;

const initialState: PreviewContentState = {
  stack: { items: [], loading: true, unavailable: false },
  certifications: { items: [], loading: true, unavailable: false },
  recommendations: { items: [], loading: true, unavailable: false },
  skills: { items: [], loading: true, unavailable: false },
};

export function useLandingContentPreview() {
  const [sections, setSections] = useState(initialState);

  useEffect(() => {
    const requests = new Map<LandingPreviewKind, AbortController>();

    const refresh = (kind?: LandingPreviewKind) => {
      const requestedKinds = kind ? [kind] : contentKinds;

      requestedKinds.forEach((requestedKind) => {
        requests.get(requestedKind)?.abort();

        const controller = new AbortController();
        requests.set(requestedKind, controller);

        void getPortfolioContent(requestedKind, controller.signal)
          .then((items) => {
            setSections((previous) => ({
              ...previous,
              [requestedKind]: {
                items,
                loading: false,
                unavailable: false,
              },
            }));
          })
          .catch(() => {
            if (controller.signal.aborted) return;

            setSections((previous) => ({
              ...previous,
              [requestedKind]: {
                ...previous[requestedKind],
                loading: false,
                unavailable: true,
              },
            }));
          })
          .finally(() => {
            if (requests.get(requestedKind) === controller) {
              requests.delete(requestedKind);
            }
          });
      });
    };

    const onContentChanged = (event: Event) => {
      const changedKind = (event as CustomEvent<{ kind?: string }>).detail
        ?.kind;
      if (!changedKind) {
        refresh();
        return;
      }

      const validKind = contentKinds.find((kind) => kind === changedKind);
      if (validKind) refresh(validKind);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "portfolio-content-changed") return;
      const changedKind = event.newValue?.split("-")[0];
      if (!changedKind || changedKind === "all") {
        refresh();
        return;
      }
      const validKind = contentKinds.find((kind) => kind === changedKind);
      if (validKind) refresh(validKind);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    window.addEventListener("portfolio-content-changed", onContentChanged);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      requests.forEach((controller) => controller.abort());
      requests.clear();
      window.removeEventListener("portfolio-content-changed", onContentChanged);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return sections;
}
