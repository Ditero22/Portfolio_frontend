import {
  ArrowUpRight,
  Code2,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { Project } from "../../projects/types/project";

export default function LandingBlindArtwork({
  project,
  icon: Icon,
  categoryLabel,
  statusLabel,
  index,
  onExplore,
  interactive = true,
}: {
  project: Project;
  icon: LucideIcon;
  categoryLabel: string;
  statusLabel: string;
  index: number;
  onExplore: () => void;
  interactive?: boolean;
}) {
  const stack = Array.isArray(project.stack) ? project.stack : [];
  const visibleStack = stack.slice(0, 4);
  const remainingStackCount = Math.max(0, stack.length - visibleStack.length);
  const highlights =
    project.highlights?.length > 0
      ? project.highlights
      : (project.contributions ?? []).map(
          (contribution) => contribution.details?.trim() || contribution.title,
        );

  return (
    <span className="landing-blind-artwork">
      <span className="landing-blind-artwork__grid" />
      <span className="landing-blind-artwork__content">
        <span className="landing-blind-artwork__project-heading">
          <span className="landing-blind-artwork__project-kicker">
            <span />
            <Icon size={11} aria-hidden="true" />
            <span className="landing-blind-artwork__category">
              {categoryLabel} project
            </span>
            <span className="landing-blind-artwork__badge landing-blind-artwork__badge--status">
              {statusLabel}
            </span>
            {project.featured && (
              <span className="landing-blind-artwork__badge landing-blind-artwork__badge--featured">
                <Star size={10} aria-hidden="true" />
                Featured
              </span>
            )}
            <span className="landing-blind-artwork__project-number">
              {String(index).padStart(2, "0")}
            </span>
          </span>
          <span className="landing-blind-artwork__title">
            {project.title || "Untitled project"}
          </span>
          {project.role?.trim() && (
            <span className="landing-blind-artwork__role">
              {project.role}
            </span>
          )}
        </span>

        <span className="landing-blind-artwork__description">
          {project.description?.trim() || "Project details are coming soon."}
        </span>

        {stack.length > 0 && (
          <span className="landing-blind-artwork__stack-section">
            <span className="landing-blind-artwork__section-label">
              <Code2 size={12} aria-hidden="true" />
              Built with
            </span>
            <span
              className="landing-blind-artwork__stack"
              aria-label="Technologies"
            >
              {visibleStack.map((technology, technologyIndex) => (
                <span key={`${technology}-${technologyIndex}`}>
                  {technology}
                </span>
              ))}
              {remainingStackCount > 0 && (
                <span className="landing-blind-artwork__stack-more">
                  +{remainingStackCount}
                </span>
              )}
            </span>
          </span>
        )}

        {highlights.length > 0 && (
          <span className="landing-blind-artwork__highlights">
            <span className="landing-blind-artwork__highlights-heading">
              Key details
            </span>
            {highlights.slice(0, 3).map((highlight, highlightIndex) => (
              <span
                className="landing-blind-artwork__highlight"
                key={`${highlightIndex}-${highlight}`}
              >
                <span className="landing-blind-artwork__highlight-index">
                  {String(highlightIndex + 1).padStart(2, "0")}
                </span>
                <span>{highlight}</span>
              </span>
            ))}
          </span>
        )}

        <button
          type="button"
          className="landing-blind-artwork__action"
          disabled={!interactive}
          tabIndex={interactive ? 0 : -1}
          onClick={(event) => {
            event.stopPropagation();
            onExplore();
          }}
        >
          <span>
            <span>Explore project</span>
            <span className="landing-blind-artwork__action-caption">
              Full details and contributions
            </span>
          </span>
          <span className="landing-blind-artwork__action-icon">
            <ArrowUpRight size={16} strokeWidth={2.2} />
          </span>
        </button>
      </span>
    </span>
  );
}
