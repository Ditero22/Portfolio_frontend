import { useCallback, useEffect, useState } from "react";
import CertificationArchive from "@/features/public/certifications/components/CertificationArchive";
import RecommendationQuotes from "@/features/public/recommendations/components/RecommendationQuotes";
import SkillMap from "@/features/public/skills/components/SkillMap";
import StackWorkbench from "@/features/public/stack/components/StackWorkbench";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";
import { publicApiRefreshIntervalMs } from "@/shared/api";
import { getPortfolioContent } from "../services/portfolioContent.service";
import type {
  PortfolioContent,
  PortfolioContentKind,
} from "../types/portfolioContent";

export interface PortfolioSectionConfig {
  kind: PortfolioContentKind;
  number: string;
  title: string;
  eyebrow: string;
  description: string;
}

export default function PortfolioContentPage({
  config,
}: {
  config: PortfolioSectionConfig;
}) {
  const [items, setItems] = useState<PortfolioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const content = await getPortfolioContent(config.kind, signal);
        if (!signal?.aborted) {
          setItems(content);
          setError(false);
        }
      } catch {
        if (!signal?.aborted) setError(true);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [config.kind],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refresh(controller.signal));
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, publicApiRefreshIntervalMs);
    const onChanged = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onContentChanged = (event: Event) => {
      const changedKind = (event as CustomEvent<{ kind?: string }>).detail
        ?.kind;
      if (!changedKind || changedKind === config.kind) onChanged();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "portfolio-content-changed") onChanged();
    };
    window.addEventListener("portfolio-content-changed", onContentChanged);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onChanged);

    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("portfolio-content-changed", onContentChanged);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onChanged);
    };
  }, [config.kind, refresh]);

  return (
    <PublicPageFrame
      number={config.number}
      eyebrow={config.eyebrow}
      title={config.title}
      description={config.description}
    >
      {loading || error || items.length === 0 ? (
        <ContentState
          error={error}
          kind={config.kind}
          loading={loading}
        />
      ) : (
        <PortfolioContentSection
          items={items}
          kind={config.kind}
        />
      )}
    </PublicPageFrame>
  );
}

function ContentState({
  error,
  kind,
  loading,
}: {
  error: boolean;
  kind: PortfolioContentKind;
  loading: boolean;
}) {
  const sectionNames: Record<PortfolioContentKind, string> = {
    stack: "tools in my stack",
    certifications: "certifications",
    recommendations: "recommendations",
    skills: "skills",
  };
  const sectionName = sectionNames[kind];
  const message = loading
    ? `Loading ${sectionName}…`
    : error
      ? "This section is temporarily unavailable. It will retry automatically."
      : `No ${sectionName} are published yet. Check back later.`;

  return (
    <div
      className="public-content-empty portfolio-reveal"
      role={error ? "status" : undefined}
    >
      <span className="public-content-empty__index">{sectionName}</span>
      <p>{message}</p>
    </div>
  );
}

function PortfolioContentSection({
  items,
  kind,
}: {
  items: PortfolioContent[];
  kind: PortfolioContentKind;
}) {
  switch (kind) {
    case "skills":
      return <SkillMap items={items} />;
    case "stack":
      return <StackWorkbench items={items} />;
    case "recommendations":
      return <RecommendationQuotes items={items} />;
    case "certifications":
      return <CertificationArchive items={items} />;
  }
}
