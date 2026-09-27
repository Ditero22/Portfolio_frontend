import { ArrowUpRight, Award, ExternalLink } from "lucide-react";
import type { PortfolioContent } from "../../portfolioContent/types/portfolioContent";

export default function CertificationArchive({
  items,
}: {
  items: PortfolioContent[];
}) {
  return (
    <div className="credential-archive">
      <div className="credential-archive__heading">
        <span>LEARNING MILESTONES</span>
        <span>{String(items.length).padStart(2, "0")} RECORDS</span>
      </div>
      <div className="credential-archive__list">
        {items.map((item, index) => (
          <article
            className="credential-record portfolio-reveal"
            key={item.id}
          >
            <span className="credential-record__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="credential-record__seal">
              <Award
                size={22}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
            <div className="credential-record__content">
              <div className="credential-record__meta">
                {item.subtitle && <span>{item.subtitle}</span>}
                {item.category && <span>{item.category}</span>}
              </div>
              <h2>{item.title}</h2>
              {item.description && <p>{item.description}</p>}
            </div>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="credential-record__link"
              >
                <span>View credential</span>
                <ExternalLink
                  size={15}
                  aria-hidden="true"
                />
                <ArrowUpRight
                  className="credential-record__mobile-arrow"
                  size={16}
                  aria-hidden="true"
                />
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
