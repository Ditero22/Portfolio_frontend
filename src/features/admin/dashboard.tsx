import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Archive,
  ArrowDownToLine,
  Eye,
  FileText,
  FolderKanban,
  HardDrive,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import {
  downloadVisitorLogs,
  getAdminAnalytics,
  type AdminAnalytics,
} from "./services/analytics.service";

const dayInMs = 24 * 60 * 60 * 1000;
const r2MonthlyIncludedBytes = 10_000_000_000;

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

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
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateBounds] = useState(() => {
    const today = new Date();
    return {
      earliest: dateInputValue(new Date(today.getTime() - 89 * dayInMs)),
      latest: dateInputValue(today),
    };
  });
  const [logFrom, setLogFrom] = useState(() =>
    dateInputValue(new Date(Date.now() - 89 * dayInMs)),
  );
  const [logTo, setLogTo] = useState(() => dateInputValue(new Date()));
  const [logPath, setLogPath] = useState("");

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

  async function exportLogs() {
    if (logFrom > logTo) {
      setError("The start date must be on or before the end date.");
      return;
    }
    if (logFrom < dateBounds.earliest || logTo > dateBounds.latest) {
      setError("Choose dates within the available 90-day log window.");
      return;
    }

    setDownloading(true);
    setError(null);
    try {
      const file = await downloadVisitorLogs({
        from: logFrom,
        to: logTo,
        path: logPath,
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portfolio-visitor-logs-${logFrom}-to-${logTo}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Could not download visitor logs.",
      );
    } finally {
      setDownloading(false);
    }
  }

  const visitorMetrics = [
    {
      label: "Today",
      value: analytics?.visitors.today ?? "—",
      detail: "Unique visitors · UTC day",
      Icon: Eye,
    },
    {
      label: "This week",
      value: analytics?.visitors.thisWeek ?? "—",
      detail: "Unique visitors · Monday to today",
      Icon: UsersRound,
    },
    {
      label: "This month",
      value: analytics?.visitors.thisMonth ?? "—",
      detail: "Unique visitors · UTC month",
      Icon: Activity,
    },
  ];
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl text-ink">Visitor activity</h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
            Refreshes every minute
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {visitorMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              {...metric}
            />
          ))}
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

      <section className="rounded-2xl border border-ink/10 bg-surface p-5 md:p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <UsersRound size={20} />
            </span>
            <div>
              <h2 className="font-medium text-ink">Visitor logs</h2>
              <p className="mt-1 max-w-xl text-xs leading-5 text-ink/55">
                Keep the latest {analytics?.retentionDays ?? 90} days of page
                visits. Older logs are removed automatically.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/45">
            CSV export
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto] lg:items-end">
          <label className="block text-xs text-ink/60">
            From (UTC)
            <input
              type="date"
              value={logFrom}
              min={dateBounds.earliest}
              max={dateBounds.latest}
              onChange={(event) => setLogFrom(event.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink"
            />
          </label>
          <label className="block text-xs text-ink/60">
            To (UTC)
            <input
              type="date"
              value={logTo}
              min={logFrom}
              max={dateBounds.latest}
              onChange={(event) => setLogTo(event.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink"
            />
          </label>
          <label className="block text-xs text-ink/60">
            Page
            <select
              value={logPath}
              onChange={(event) => setLogPath(event.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink"
            >
              <option value="">All pages</option>
              <option value="/">Landing page</option>
              <option value="/blog">Blog and articles</option>
              <option value="/projects">Projects</option>
              <option value="/experience">Experience</option>
              <option value="/gear">Gear</option>
              <option value="/resources">Resources</option>
              <option value="/stack">Stack</option>
              <option value="/certifications">Certifications</option>
              <option value="/recommendations">Recommendations</option>
              <option value="/skills">Skills</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void exportLogs()}
            disabled={downloading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition hover:bg-ink/80 disabled:opacity-50"
          >
            <ArrowDownToLine size={16} />
            {downloading ? "Preparing…" : "Download CSV"}
          </button>
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
