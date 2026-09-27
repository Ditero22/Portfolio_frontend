import { ArrowUpRight, Quote } from "lucide-react";
import type { PortfolioContent } from "../../portfolioContent/types/portfolioContent";

export default function RecommendationQuotes({
  items,
}: {
  items: PortfolioContent[];
}) {
  return (
    <div className="recommendation-wall">
      {items.map((item, index) => (
        <figure
          className="recommendation-quote portfolio-reveal"
          key={item.id}
        >
          <div className="recommendation-quote__topline">
            <span className="recommendation-quote__index">
              WORDS / {String(index + 1).padStart(2, "0")}
            </span>
            {item.category && (
              <span className="recommendation-quote__context">
                {item.category}
              </span>
            )}
          </div>
          <Quote
            className="recommendation-quote__mark"
            size={32}
            strokeWidth={1.3}
            aria-hidden="true"
          />
          {item.description && (
            <blockquote>{item.description}</blockquote>
          )}
          <figcaption>
            <span className="recommendation-quote__avatar">
              {item.title.trim().slice(0, 1).toUpperCase()}
            </span>
            <span className="recommendation-quote__author">
              <strong>{item.title}</strong>
              {item.subtitle && <span>{item.subtitle}</span>}
            </span>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`View more about ${item.title}`}
                className="recommendation-quote__link"
              >
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                />
              </a>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
