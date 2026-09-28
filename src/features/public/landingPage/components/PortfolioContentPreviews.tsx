import {
  ArrowUpRight,
  Award,
  Code2,
  Layers3,
  Network,
  Quote,
  Server,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import type {
  PortfolioContent,
  PortfolioContentKind,
} from "../../portfolioContent/types/portfolioContent";
import { useLandingContentPreview } from "../hooks/useLandingContentPreview";

interface PreviewSectionProps {
  number: string;
  title: string;
  href: string;
  children: ReactNode;
}

function PreviewSection({
  number,
  title,
  href,
  children,
}: PreviewSectionProps) {
  return (
    <section className="portfolio-reveal">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/45">
            {number} / Explore
          </p>
          <h2 className="text-3xl text-ink">{title}</h2>
        </div>
        <Link
          to={href}
          className="group mb-1 inline-flex shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-ink/60 transition-colors hover:text-ink"
        >
          View all
          <ArrowUpRight
            size={13}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </Link>
      </header>
      {children}
    </section>
  );
}

function EmptyPreview({
  kind,
  loading,
  unavailable,
}: {
  kind: PortfolioContentKind;
  loading: boolean;
  unavailable: boolean;
}) {
  const messages: Record<PortfolioContentKind, string> = {
    stack: "Tools I use will appear here when published.",
    certifications: "Learning milestones will appear here when published.",
    recommendations: "Recommendations will appear here when published.",
    skills:
      "Frontend, backend, and networking skills will appear here when published.",
  };

  return (
    <p className="portfolio-preview-empty">
      {loading
        ? "Loading selected items…"
        : unavailable
          ? "This preview is temporarily unavailable."
          : messages[kind]}
    </p>
  );
}

function StackPreview({
  items,
  loading,
  unavailable,
}: {
  items: PortfolioContent[];
  loading: boolean;
  unavailable: boolean;
}) {
  return (
    <div className="portfolio-detail-card portfolio-stack-preview">
      <div className="portfolio-detail-card__topline">
        <span className="portfolio-detail-card__icon">
          <Layers3 size={16} aria-hidden="true" />
        </span>
        <span>Tools in practice</span>
        <span className="portfolio-detail-card__count">
          {String(items.length).padStart(2, "0")} SELECTED
        </span>
      </div>
      {items.length ? (
        <div className="portfolio-stack-preview__items">
          {items.slice(0, 6).map((item) => (
            <article className="portfolio-stack-chip" key={item.id}>
              <span>{item.title}</span>
              {item.category && <small>{item.category}</small>}
            </article>
          ))}
          {items.length > 6 && (
            <span className="portfolio-stack-preview__more">
              +{items.length - 6} more
            </span>
          )}
        </div>
      ) : (
        <EmptyPreview
          kind="stack"
          loading={loading}
          unavailable={unavailable}
        />
      )}
    </div>
  );
}

function SkillsPreview({
  items,
  loading,
  unavailable,
}: {
  items: PortfolioContent[];
  loading: boolean;
  unavailable: boolean;
}) {
  const groups = [
    { label: "Frontend", icon: Code2 },
    { label: "Backend", icon: Server },
    { label: "Networking", icon: Network },
  ] as const;

  return (
    <div className="portfolio-skills-preview">
      {items.length ? (
        groups.map(({ label, icon: Icon }) => {
          const skills = items.filter(
            (item) => item.category?.toLowerCase() === label.toLowerCase(),
          );

          return (
            <article className="portfolio-skills-preview__group" key={label}>
              <div className="portfolio-skills-preview__heading">
                <span>
                  <Icon size={15} aria-hidden="true" />
                </span>
                <h3>{label}</h3>
                <small>{String(skills.length).padStart(2, "0")}</small>
              </div>
              {skills.length ? (
                <ul>
                  {skills.slice(0, 4).map((skill) => (
                    <li key={skill.id}>
                      <span>{skill.title}</span>
                      {skill.subtitle && <small>{skill.subtitle}</small>}
                    </li>
                  ))}
                  {skills.length > 4 && (
                    <li className="portfolio-skills-preview__more">
                      +{skills.length - 4} more
                    </li>
                  )}
                </ul>
              ) : (
                <p className="portfolio-skills-preview__empty">
                  More {label.toLowerCase()} skills are on the way.
                </p>
              )}
            </article>
          );
        })
      ) : (
        <div className="portfolio-detail-card portfolio-skills-preview__state">
          <EmptyPreview
            kind="skills"
            loading={loading}
            unavailable={unavailable}
          />
        </div>
      )}
    </div>
  );
}

function CertificationsPreview({
  items,
  loading,
  unavailable,
}: {
  items: PortfolioContent[];
  loading: boolean;
  unavailable: boolean;
}) {
  return (
    <div className="portfolio-detail-card portfolio-record-preview">
      <div className="portfolio-detail-card__topline">
        <span className="portfolio-detail-card__icon">
          <Award size={16} aria-hidden="true" />
        </span>
        <span>Learning milestones</span>
        <span className="portfolio-detail-card__count">
          {String(items.length).padStart(2, "0")} RECORDS
        </span>
      </div>
      {items.length ? (
        <div className="portfolio-record-preview__list">
          {items.slice(0, 2).map((item, index) => (
            <article key={item.id}>
              <span className="portfolio-record-preview__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.subtitle || item.category || "Certification"}</p>
              </div>
              <Award size={16} aria-hidden="true" />
            </article>
          ))}
        </div>
      ) : (
        <EmptyPreview
          kind="certifications"
          loading={loading}
          unavailable={unavailable}
        />
      )}
    </div>
  );
}

function RecommendationsPreview({
  items,
  loading,
  unavailable,
}: {
  items: PortfolioContent[];
  loading: boolean;
  unavailable: boolean;
}) {
  return (
    <div className="portfolio-recommendation-preview">
      {items.length ? (
        items.slice(0, 2).map((item, index) => (
          <figure className="portfolio-recommendation-card" key={item.id}>
            <div className="portfolio-recommendation-card__topline">
              <span>WORDS / {String(index + 1).padStart(2, "0")}</span>
              {item.category && <span>{item.category}</span>}
            </div>
            <Quote size={20} aria-hidden="true" />
            {item.description && <blockquote>{item.description}</blockquote>}
            <figcaption>
              <span className="portfolio-recommendation-card__avatar">
                {item.title.trim().slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{item.title}</strong>
                {item.subtitle && <small>{item.subtitle}</small>}
              </span>
            </figcaption>
          </figure>
        ))
      ) : (
        <div className="portfolio-detail-card">
          <EmptyPreview
            kind="recommendations"
            loading={loading}
            unavailable={unavailable}
          />
        </div>
      )}
    </div>
  );
}

export default function PortfolioContentPreviews() {
  const sections = useLandingContentPreview();

  return (
    <div className="mt-16 space-y-16 md:mt-20 md:space-y-20">
      <PreviewSection number="06" title="Stack" href="/stack">
        <StackPreview {...sections.stack} />
      </PreviewSection>
      <PreviewSection number="07" title="Skills" href="/skills">
        <SkillsPreview {...sections.skills} />
      </PreviewSection>
      <PreviewSection
        number="08"
        title="Certifications"
        href="/certifications"
      >
        <CertificationsPreview {...sections.certifications} />
      </PreviewSection>
      <PreviewSection
        number="09"
        title="Recommendations"
        href="/recommendations"
      >
        <RecommendationsPreview {...sections.recommendations} />
      </PreviewSection>
    </div>
  );
}
