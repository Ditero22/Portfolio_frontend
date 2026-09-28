import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Code2,
  FileText,
  FolderKanban,
  HardDrive,
  Layers3,
  RefreshCw,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminRoutes } from "@/shared/routing/adminRoutes";
import {
  getAdminAnalytics,
  type AdminAnalytics,
} from "./services/analytics.service";

const r2MonthlyIncludedBytes = 10_000_000_000;
const viewerPeriods = [
  {
    value: "day",
    label: "Day",
    shortLabel: "D",
    key: "today",
    detail: "Today · UTC",
  },
  {
    value: "week",
    label: "Week",
    shortLabel: "W",
    key: "thisWeek",
    detail: "Monday to today · UTC",
  },
  {
    value: "month",
    label: "Month",
    shortLabel: "M",
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
    <article className="admin-dashboard-card rounded-2xl border border-ink/10 bg-surface p-5">
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

function ManagementCard({
  label,
  value,
  detail,
  href,
  Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  href: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      to={href}
      aria-label={`Manage ${label}: ${value}. ${detail}`}
      className="admin-dashboard-card group min-w-0 rounded-xl border border-ink/10 bg-surface p-3 transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/35 hover:shadow-lg hover:shadow-teal-950/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:p-4"
    >
      <div className="flex min-w-0 items-start justify-between gap-1.5 sm:gap-3">
        <p className="min-w-0 break-words font-mono text-[9px] uppercase tracking-[0.1em] text-ink/45 sm:text-[10px] sm:tracking-[0.16em]">
          {label}
        </p>
        <span className="shrink-0 rounded-lg bg-teal-500/10 p-1.5 text-teal-600 transition group-hover:bg-teal-500/15">
          <Icon
            size={15}
            aria-hidden="true"
          />
        </span>
      </div>
      <p className="mt-2 break-words text-xl leading-tight tabular-nums text-ink sm:mt-3 sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 min-h-8 text-[10px] leading-4 text-ink/50 sm:text-[11px]">
        {detail}
      </p>
      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-teal-700 transition group-hover:gap-2 sm:gap-1.5 sm:text-[11px]">
        <span className="sm:hidden">Open</span>
        <span className="hidden sm:inline">Open {label.toLowerCase()}</span>
        <ArrowUpRight
          size={13}
          aria-hidden="true"
        />
      </span>
    </Link>
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
  const content = analytics?.content;
  const projectDetail = content
    ? `${content.publishedProjects} public · ${content.hiddenProjects} hidden`
    : "Loading project visibility…";
  const experienceDetail = content
    ? `${content.experience.published} public · ${content.experience.hidden} hidden`
    : "Loading experience entries…";
  const statusDetail = (visibility: AdminAnalytics["content"]["stack"]) =>
    `${visibility.published} public · ${visibility.hidden} hidden`;

  return (
    <div className="mx-auto max-w-6xl pb-20">
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

      <div className="mb-8 grid items-stretch gap-5 xl:grid-cols-[minmax(165px,0.8fr)_minmax(0,4fr)]">
        <section className="admin-dashboard-card flex min-w-0 flex-col rounded-2xl border border-ink/10 bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 xl:flex-col xl:items-start">
            <div>
              <h2 className="text-lg text-ink">Visitor activity</h2>
              <p className="mt-0.5 text-xs text-ink/50">Unique viewers · UTC</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-500/10 px-2 py-1 text-[10px] font-medium text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              {analytics?.onlineViewers ?? 0} online
            </span>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/40">
              Range
            </p>
            <div
              role="group"
              aria-label="Viewer count time range"
              className="grid grid-cols-3 gap-1.5"
            >
              {viewerPeriods.map((period) => {
                const selected = viewerPeriod === period.value;
                return (
                  <button
                    key={period.value}
                    type="button"
                    aria-label={period.label}
                    aria-pressed={selected}
                    title={period.label}
                    onClick={() => setViewerPeriod(period.value)}
                    className={`min-h-9 rounded-lg border font-mono text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${selected ? "border-teal-600 bg-teal-600 text-white shadow-sm shadow-teal-950/10" : "border-ink/10 bg-paper/60 text-ink/55 hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-ink"}`}
                  >
                    {period.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-dashboard-summary mt-3 rounded-xl border border-teal-500/10 bg-gradient-to-br from-teal-500/[0.08] via-paper/70 to-paper/70 p-3 sm:p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/45">
              {selectedViewerPeriod.detail}
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p
                className="text-4xl leading-none tabular-nums text-ink"
                aria-live="polite"
                aria-atomic="true"
              >
                {analytics?.visitors[selectedViewerPeriod.key] ?? "—"}
              </p>
              <UsersRound
                size={20}
                className="mb-0.5 shrink-0 text-teal-600/60"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-ink/50">
              unique visitors in this period
            </p>
          </div>

          <div className="mt-auto flex items-center gap-1.5 pt-3 text-[10px] text-ink/45">
            <Clock3
              size={12}
              aria-hidden="true"
            />
            <span>Refreshes every minute</span>
          </div>
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-lg text-ink">Portfolio content</h2>
            <p className="mt-1 text-xs text-ink/50">
              Select a card to see and manage that section.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
            <ManagementCard
              label="Blog posts"
              value={analytics?.content.posts ?? "—"}
              detail={`${analytics?.content.publishedPosts ?? "—"} published · ${analytics?.content.draftPosts ?? "—"} drafts`}
              Icon={FileText}
              href={adminRoutes.blog}
            />
            <ManagementCard
              label="Projects"
              value={analytics?.content.projects ?? "—"}
              detail={projectDetail}
              Icon={FolderKanban}
              href={adminRoutes.projects}
            />
            <ManagementCard
              label="Experience"
              value={content?.experience.total ?? "—"}
              detail={experienceDetail}
              Icon={BriefcaseBusiness}
              href={adminRoutes.experience}
            />
            <ManagementCard
              label="Stack"
              value={content?.stack.total ?? "—"}
              detail={
                content ? statusDetail(content.stack) : "Loading stack entries…"
              }
              Icon={Layers3}
              href={adminRoutes.stack}
            />
            <ManagementCard
              label="Skills"
              value={content?.skills.total ?? "—"}
              detail={
                content ? statusDetail(content.skills) : "Loading skills…"
              }
              Icon={Code2}
              href={adminRoutes.skills}
            />
            <ManagementCard
              label="Certifications"
              value={content?.certifications.total ?? "—"}
              detail={
                content
                  ? statusDetail(content.certifications)
                  : "Loading certifications…"
              }
              Icon={Award}
              href={adminRoutes.certifications}
            />
            <ManagementCard
              label="Recommendations"
              value={content?.recommendations.total ?? "—"}
              detail={
                content
                  ? statusDetail(content.recommendations)
                  : "Loading recommendations…"
              }
              Icon={UserRoundCheck}
              href={adminRoutes.recommendations}
            />
            <ManagementCard
              label="Availability"
              value={
                analytics
                  ? analytics.settings.isHired
                    ? "Currently hired"
                    : "Available"
                  : "—"
              }
              detail={
                analytics ? "Public hiring status" : "Loading availability…"
              }
              Icon={BadgeCheck}
              href={adminRoutes.settings}
            />
          </div>
        </section>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl text-ink">Storage</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </div>
  );
}

export default Dashboard;
