import { useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  CalendarDays,
  Code2,
  GraduationCap,
  Layers3,
  MapPin,
} from "lucide-react";
import { getHiringStatus } from "@/features/public/availability/services/availability.service";
import ResumeDownload from "@/features/public/resume/components/ResumeDownload";
import { publicApiRefreshIntervalMs } from "@/shared/api";
import profileFormal from "@/assets/profile-formal.png";
import profileLookUp from "@/assets/profile-look-up.png";
import profileLookSide from "@/assets/profile-look-side.png";
import profileSide from "@/assets/profile-side.png";
import profileSmile from "@/assets/profile-smile.png";
import profileWink from "@/assets/profile-wink.png";

const stats = [
  {
    value: "24",
    label: "Age",
    detail: "A quick introduction",
    Icon: CalendarDays,
  },
  {
    value: "IT",
    label: "Degree",
    detail: "Information Technology",
    Icon: GraduationCap,
  },
  {
    value: "3+",
    label: "Projects",
    detail: "Web and mobile work",
    Icon: Layers3,
  },
  {
    value: "PH",
    label: "Based in",
    detail: "Philippines",
    Icon: MapPin,
  },
];

function ProfilePortrait() {
  const [phase, setPhase] = useState<"follow" | "formal" | "smile" | "wink">(
    "follow",
  );
  const [followPose, setFollowPose] = useState(profileFormal);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const portraitFrame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const duration =
      phase === "follow"
        ? 10_000
        : phase === "formal"
          ? 4_000
          : phase === "smile"
            ? 4_000
            : 3_000;
    const next =
      phase === "follow"
        ? "formal"
        : phase === "formal"
          ? "smile"
          : phase === "smile"
            ? "wink"
            : "follow";
    const timer = window.setTimeout(() => setPhase(next), duration);
    return () => window.clearTimeout(timer);
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    if (phase !== "follow" || prefersReducedMotion) return;
    const followCursor = (event: globalThis.PointerEvent) => {
      const bounds = portraitFrame.current?.getBoundingClientRect();
      if (!bounds) return;
      if (event.clientY < bounds.top) setFollowPose(profileLookUp);
      else if (event.clientX > bounds.right) setFollowPose(profileLookSide);
      else if (event.clientX < bounds.left) setFollowPose(profileSide);
      else setFollowPose(profileFormal);
    };
    window.addEventListener("pointermove", followCursor);
    return () => window.removeEventListener("pointermove", followCursor);
  }, [phase, prefersReducedMotion]);

  const visiblePhase = prefersReducedMotion ? "formal" : phase;
  const photo =
    visiblePhase === "follow"
      ? followPose
      : visiblePhase === "formal"
        ? profileFormal
        : visiblePhase === "smile"
          ? profileSmile
          : profileWink;

  return (
    <div className="landing-portrait-wrap">
      <div className="landing-portrait-orbit landing-portrait-orbit--outer" />
      <div className="landing-portrait-orbit landing-portrait-orbit--inner" />
      <div
        ref={portraitFrame}
        className="landing-portrait-frame"
      >
        <img
          key={photo}
          src={photo}
          alt="Karl Diether"
          className="profile-photo-enter h-full w-full object-contain object-bottom grayscale"
        />
        <span className="landing-portrait-index">01 / 04</span>
      </div>
      <div className="landing-portrait-caption">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          <span>IT GRADUATE · DEVELOPER</span>
        </div>
      </div>
    </div>
  );
}

function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-topline">
        <span>
          PERSONAL PORTFOLIO <span className="text-ink/30">/</span> 2026
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> PHILIPPINES
        </span>
      </div>

      <div className="landing-hero-content">
        <div className="flex justify-center lg:justify-start">
          <ProfilePortrait />
        </div>

        <div className="landing-hero-copy">
          <p className="landing-hero-eyebrow">
            <Code2 size={14} /> WEB · MOBILE · NETWORKING
          </p>
          <h1 className="landing-hero-title">
            Karl <span>Diether</span>
          </h1>
          <p className="landing-hero-lead">
            Building practical digital experiences.
          </p>
          <p className="landing-hero-description">
            I build web and mobile applications, software projects, and network
            solutions with a focus on clean design, functionality, and
            continuous learning.
          </p>
          <div
            className="landing-skill-list"
            aria-label="Project focus areas"
          >
            <span>Web applications</span>
            <span>Mobile apps</span>
            <span>Networking projects</span>
          </div>
          <div className="landing-hero-actions">
            <HiringStatus />
            <ResumeDownload />
            <a
              href="mailto:karldietherortega@gmail.com"
              className="landing-secondary-action"
            >
              Get in touch <ArrowDownRight size={15} />
            </a>
          </div>
        </div>
      </div>

      <div className="landing-hero-footer">
        <span>DESIGN WITH INTENTION</span>
        <span className="landing-footer-rule" />
        <span>BUILT FOR REAL USE</span>
      </div>
    </section>
  );
}

function HiringStatus() {
  const [isHired, setIsHired] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    let request: AbortController | null = null;
    let refreshQueued = false;

    async function refresh() {
      if (document.visibilityState === "hidden") return;
      if (request) {
        refreshQueued = true;
        return;
      }

      const controller = new AbortController();
      request = controller;
      try {
        const status = await getHiringStatus(controller.signal);
        if (active && !controller.signal.aborted) {
          setIsHired(
            typeof status.isHired === "boolean" ? status.isHired : null,
          );
        }
      } catch {
        // Keep the last known value; the initial unknown state stays explicit.
      } finally {
        if (request === controller) {
          request = null;
          if (active && !controller.signal.aborted) setLoaded(true);
          if (active && refreshQueued) {
            refreshQueued = false;
            void refresh();
          }
        }
      }
    }

    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !request) void refresh();
    }, publicApiRefreshIntervalMs);
    const onChanged = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "portfolio-hiring-status-changed") void refresh();
    };
    window.addEventListener("portfolio-hiring-status-changed", onChanged);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onChanged);
    return () => {
      active = false;
      request?.abort();
      window.clearInterval(timer);
      window.removeEventListener("portfolio-hiring-status-changed", onChanged);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onChanged);
    };
  }, []);

  return (
    <span
      className={`landing-status-pill ${isHired === null ? "is-unknown" : isHired ? "is-hired" : "is-available"}`}
      role="status"
      aria-live="polite"
    >
      <span className="landing-status-dot" />
      {loaded
        ? isHired === null
          ? "Availability unavailable"
          : isHired
            ? "Currently hired"
            : "Available for work"
        : "Checking availability"}
    </span>
  );
}

function StatsGrid() {
  return (
    <section
      className="landing-stats"
      aria-label="A few facts about me"
    >
      <div className="landing-stats-heading">
        <span>AT A GLANCE</span>
        <span>01 — 04</span>
      </div>
      <div className="landing-stats-grid">
        {stats.map(({ value, label, detail, Icon }, index) => (
          <article
            key={label}
            className="landing-stat-card"
          >
            <div className="flex items-center justify-between">
              <span className="landing-stat-index">0{index + 1}</span>
              <Icon
                size={17}
                strokeWidth={1.5}
                className="text-teal-400/80"
                aria-hidden="true"
              />
            </div>
            <p className="landing-stat-value">{value}</p>
            <p className="landing-stat-label">{label}</p>
            <p className="landing-stat-detail">{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function LandingIntro() {
  return (
    <>
      <LandingHero />
      <StatsGrid />
    </>
  );
}
