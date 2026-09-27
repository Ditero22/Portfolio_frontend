import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  Eye,
  FileText,
  FolderKanban,
  HardDrive,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import {
  getAdminAnalytics,
  type AdminAnalytics,
} from "./services/analytics.service";

const r2MonthlyIncludedBytes = 10_000_000_000;
const viewerPeriods = [
  { value: "day", label: "Day", key: "today", detail: "Today · UTC" },
  {
    value: "week",
    label: "Week",
    key: "thisWeek",
    detail: "Monday to today · UTC",
  },
  {
    value: "month",
    label: "Month",
    key: "thisMonth",
    detail: "This month · UTC",
  },
] as const;
type ViewerPeriod = (typeof viewerPeriods)[number]["value"];

function formatBytes(bytes: number) {
  if (bytes < 1000) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1000;
  let index = 0;
  while (size >= 1000 && index < units.length - 1) {
    size /= 1000;
    index += 1;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[index]}`;
}

function MetricCard({
  label,
  value,
  detail,
  Icon,
  progress,
  note,
}: {
  label: string;
  value: string | number;
  detail: string;
  Icon: typeof UsersRound;
  progress?: number;
  note?: string;
}) {
  const progressWidth =
    progress === undefined ? undefined : Math.min(Math.max(progress, 0), 100);
  const progressColor =
    progress === undefined
      ? ""
      : progress >= 100
        ? "bg-red-500"
        : progress >= 80
          ? "bg-amber-500"
          : "bg-teal-500";

  return (
    <article className="rounded-2xl border border-ink/10 bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
          {label}
        </p>
        <Icon
          size={17}
          className="text-teal-600/80"
          aria-hidden="true"
        />
      </div>
      <p className="mt-5 text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs leading-5 text-ink/50">{detail}</p>
      {progressWidth !== undefined && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-label="R2 included storage allowance used"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressWidth}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${progressColor}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      )}
      {note && <p className="mt-2 text-[10px] leading-4 text-ink/40">{note}</p>}
    </article>
  );
}

function Dashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerPeriod, setViewerPeriod] = useState<ViewerPeriod>("day");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const snapshot = await getAdminAnalytics(signal);
      if (!signal?.aborted) {
        setAnalytics(snapshot);
        setError(null);
      }
    } catch (loadError) {
      if (!signal?.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load analytics.",
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refresh(controller.signal));
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 60_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);

  const selectedViewerPeriod = viewerPeriods.find(
    (period) => period.value === viewerPeriod,
  )!;
  const storageBytes =
    analytics?.storage.available && analytics.storage.bytes !== null
      ? analytics.storage.bytes
      : null;
  const storagePercent =
    storageBytes === null
      ? null
      : Math.round((storageBytes / r2MonthlyIncludedBytes) * 100);
  const storageDetail =
    storageBytes === null
      ? "Check R2 credentials and bucket access"
      : `${storagePercent}% of 10 GB-month included · ${analytics?.storage.objects ?? 0} files${storageBytes > r2MonthlyIncludedBytes ? " · extra storage may be billed" : ""}`;

  return (
    <main className="mx-auto max-w-6xl pb-20">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">
            Portfolio / Overview
          </p>
          <h1 className="text-4xl text-ink">Dashboard</h1>
          <p className="mt-2 text-sm text-ink/55">
            Content, storage, and visitor activity in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm text-ink transition hover:bg-ink/5 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl text-ink">Visitor activity</h2>
            <p className="mt-1 text-xs text-ink/50">
              Unique viewers in the selected time range.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
            Refreshes every minute
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
          <div
            role="group"
            aria-label="Viewer count time range"
            className="flex rounded-2xl border border-ink/10 bg-surface p-2"
          >
            {viewerPeriods.map((period) => {
              const selected = viewerPeriod === period.value;
              return (
                <button
                  key={period.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setViewerPeriod(period.value)}
                  className={`min-h-12 flex-1 rounded-xl px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${selected ? "bg-ink text-paper shadow-sm" : "text-ink/60 hover:bg-ink/5 hover:text-ink"}`}
                >
                  {period.label}
                </button>
              );
            })}
          </div>
          <article className="flex items-center justify-between gap-5 rounded-2xl border border-ink/10 bg-surface p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
                {selectedViewerPeriod.detail}
              </p>
              <p
                className="mt-2 text-4xl tabular-nums text-ink"
                aria-live="polite"
                aria-atomic="true"
              >
                {analytics?.visitors[selectedViewerPeriod.key] ?? "—"}
              </p>
              <p className="mt-1 text-xs text-ink/50">Unique viewers</p>
            </div>
            <div className="rounded-xl bg-teal-500/10 p-3 text-teal-600">
              <Eye
                size={22}
                aria-hidden="true"
              />
            </div>
          </article>
          <p className="text-xs text-ink/45 lg:col-span-2">
            {analytics?.onlineViewers ?? 0} viewers currently online · counts
            use UTC boundaries.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl text-ink">Content</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Blog posts"
            value={analytics?.content.posts ?? "—"}
            detail={`${analytics?.content.publishedPosts ?? "—"} published · ${analytics?.content.draftPosts ?? "—"} drafts`}
            Icon={FileText}
          />
          <MetricCard
            label="Published posts"
            value={analytics?.content.publishedPosts ?? "—"}
            detail="Visible on the public blog"
            Icon={Archive}
          />
          <MetricCard
            label="Projects"
            value={analytics?.content.projects ?? "—"}
            detail="Active project records"
            Icon={FolderKanban}
          />
          <MetricCard
            label="R2 storage"
            value={
              storageBytes === null ? "Unavailable" : formatBytes(storageBytes)
            }
            detail={storageDetail}
            progress={storagePercent ?? undefined}
            note="Current configured-bucket snapshot. The allowance is account-wide, and R2 billing uses a monthly average."
            Icon={HardDrive}
          />
        </div>
      </section>

      {analytics?.generatedAt && (
        <p className="mt-5 text-right font-mono text-[10px] text-ink/40">
          Updated {new Date(analytics.generatedAt).toLocaleTimeString()}
        </p>
      )}
    </main>
  );
}

export default Dashboard;
