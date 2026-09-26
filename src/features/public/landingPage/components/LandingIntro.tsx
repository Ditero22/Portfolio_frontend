import { useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Code2,
  GraduationCap,
  Layers3,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
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
  const portraitFrame = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [phase]);

  useEffect(() => {
    if (phase !== "follow") return;
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
  }, [phase]);

  const photo =
    phase === "follow"
      ? followPose
      : phase === "formal"
        ? profileFormal
        : phase === "smile"
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
      <div className="landing-portrait-caption mt-3">
        <span className="h-2 w-2 rounded-full bg-teal-400" />
        <span>IT GRADUATE · DEVELOPER</span>
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
            <Code2 size={14} /> FRONTEND · UI/UX · CURIOUS BY NATURE
          </p>
          <h1 className="landing-hero-title">
            Karl <span>Diether</span>
          </h1>
          <p className="landing-hero-lead">
            I turn ideas into useful digital experiences.
          </p>
          <p className="landing-hero-description">
            I’m an IT graduate who enjoys building modern web applications,
            shaping thoughtful interfaces, and learning new technologies along
            the way.
          </p>
          <div
            className="landing-skill-list"
            aria-label="Areas of interest"
          >
            <span>Frontend development</span>
            <span>UI &amp; UX</span>
            <span>Flutter &amp; Dart</span>
          </div>
          <div className="landing-hero-actions">
            <Link
              to="/projects"
              className="landing-primary-action"
            >
              Explore my work <ArrowUpRight size={16} />
            </Link>
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
        <span>BUILD WITH CURIOSITY</span>
      </div>
    </section>
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
