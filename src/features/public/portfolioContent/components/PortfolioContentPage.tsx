import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Award, Code2, Quote, Sparkles } from "lucide-react";
import { getPortfolioContent } from "../services/portfolioContent.service";
import type {
  PortfolioContent,
  PortfolioContentKind,
} from "../types/portfolioContent";
import { publicApiRefreshIntervalMs } from "@/shared/api";

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

  const groups =
    config.kind === "skills"
      ? [
          {
            title: "Frontend",
            items: items.filter(
              (item) => item.category?.toLowerCase() === "frontend",
            ),
          },
          {
            title: "Backend",
            items: items.filter(
              (item) => item.category?.toLowerCase() === "backend",
            ),
          },
          {
            title: "Other skills",
            items: items.filter(
              (item) =>
                !["frontend", "backend"].includes(
                  item.category?.toLowerCase() ?? "",
                ),
            ),
          },
        ]
      : [];

  return (
    <main className="mx-auto max-w-5xl pb-20">
      <header className="relative mb-10 overflow-hidden rounded-3xl border border-ink/10 bg-surface px-6 py-10 md:mb-14 md:px-12 md:py-14">
        <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative">
          <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/45">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            {config.number} / {config.eyebrow}
          </p>
          <h1 className="text-4xl text-ink md:text-6xl">{config.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65 md:text-base">
            {config.description}
          </p>
        </div>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink/10 bg-surface p-8 text-sm text-ink/55">
          Loading {config.title.toLowerCase()}…
        </p>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-ink/20 p-8 text-ink/60">
          This section is temporarily unavailable. It will retry automatically.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 p-8 text-ink/60">
          New {config.title.toLowerCase()} will appear here when published.
        </div>
      ) : config.kind === "skills" ? (
        <div className="space-y-10">
          {groups.map((group, groupIndex) =>
            group.items.length ? (
              <section key={group.title}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-xs text-teal-500">
                    0{groupIndex + 1}
                  </span>
                  <h2 className="text-2xl text-ink">{group.title}</h2>
                  <span className="h-px flex-1 bg-ink/10" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <ContentCard
                      item={item}
                      kind={config.kind}
                      key={item.id}
                    />
                  ))}
                </div>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ContentCard
              item={item}
              kind={config.kind}
              key={item.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ContentCard({
  item,
  kind,
}: {
  item: PortfolioContent;
  kind: PortfolioContentKind;
}) {
  const Icon =
    kind === "certifications"
      ? Award
      : kind === "recommendations"
        ? Quote
        : kind === "skills"
          ? Sparkles
          : Code2;
  const recommendation = kind === "recommendations";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-400/40 hover:shadow-[0_16px_50px_-30px_rgba(45,212,191,0.45)]">
      <div className="mb-6 flex items-start justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/[0.07] text-teal-500">
          <Icon
            size={18}
            strokeWidth={1.7}
          />
        </span>
        {item.category && (
          <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/55">
            {item.category}
          </span>
        )}
      </div>
      {recommendation && (
        <span className="mb-2 block font-serif text-4xl leading-none text-teal-500/60">
          “
        </span>
      )}
      <h2 className="text-xl text-ink">{item.title}</h2>
      {item.subtitle && (
        <p className="mt-1 text-sm text-ink/55">{item.subtitle}</p>
      )}
      {item.description && (
        <p
          className={`mt-4 text-sm leading-7 text-ink/65 ${recommendation ? "italic" : ""}`}
        >
          {item.description}
        </p>
      )}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-xs text-teal-600 transition hover:text-teal-400"
        >
          {kind === "certifications" ? "View credential" : "Learn more"}
          <ArrowUpRight size={14} />
        </a>
      )}
    </article>
  );
}
