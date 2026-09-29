import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Resource } from "../types/resource";

interface ResourceCardProps {
  resource: Resource;
  groupTitle?: string;
  index?: number;
}

export default function ResourceCard({
  resource,
  groupTitle,
  index = 0,
}: ResourceCardProps) {
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`resource-library-row group${resource.label ? "" : " is-no-tag"}`}
    >
      <span className="resource-library-row__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="resource-library-row__icon">
        <BookOpen size={17} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="resource-library-row__content">
        <span className="resource-library-row__category">
          {groupTitle || resource.label}
        </span>
        <span className="resource-library-row__title">{resource.title}</span>
        <span className="resource-library-row__description">
          {resource.description}
        </span>
        {resource.bestFor && (
          <span className="resource-library-row__best-for">
            <span>Best for</span>
            {resource.bestFor}
          </span>
        )}
      </span>
      {resource.label && (
        <span className="resource-library-row__tag">{resource.label}</span>
      )}
      <ArrowUpRight
        className="resource-library-row__arrow"
        size={17}
        aria-hidden="true"
      />
    </a>
  );
}
