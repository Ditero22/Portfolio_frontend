import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { ResourceGroup } from "../types/resource";
import ResourceCard from "./ResourceCard";

const RESOURCE_PAGE_SIZE = 10;

export default function ResourceLibrary({
  groups,
}: {
  groups: ResourceGroup[];
}) {
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const entries = useMemo(
    () =>
      groups.flatMap((group) =>
        group.resources.map((resource, index) => ({
          resource,
          group,
          index,
        })),
      ),
    [groups],
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredEntries = useMemo(
    () =>
      entries.filter(({ resource, group }) => {
        const matchesGroup =
          selectedGroup === "All" || group.title === selectedGroup;
        const searchText = [
          resource.title,
          resource.description,
          resource.bestFor,
          resource.label,
          group.title,
        ]
          .join(" ")
          .toLocaleLowerCase();

        return matchesGroup && searchText.includes(normalizedQuery);
      }),
    [entries, normalizedQuery, selectedGroup],
  );
  const pageCount = Math.max(
    1,
    Math.ceil(filteredEntries.length / RESOURCE_PAGE_SIZE),
  );
  const page = Math.min(currentPage, pageCount);
  const pageStart = (page - 1) * RESOURCE_PAGE_SIZE;
  const visibleEntries = filteredEntries.slice(
    pageStart,
    pageStart + RESOURCE_PAGE_SIZE,
  );
  const pageEnd = Math.min(
    pageStart + RESOURCE_PAGE_SIZE,
    filteredEntries.length,
  );
  const showPagination = filteredEntries.length > RESOURCE_PAGE_SIZE;
  const activeDescription = groups.find(
    (group) => group.title === selectedGroup,
  )?.description;

  return (
    <div className="resource-library">
      <div className="resource-library__toolbar">
        <label className="resource-library__search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search resources</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search tools, topics, or references"
          />
          <kbd aria-hidden="true">⌕</kbd>
        </label>

        <div
          className="resource-library__filters"
          role="group"
          aria-label="Filter resources by collection"
        >
          <span className="resource-library__filter-label">
            <SlidersHorizontal size={13} aria-hidden="true" /> Collections
          </span>
          <button
            type="button"
            aria-pressed={selectedGroup === "All"}
            onClick={() => {
              setSelectedGroup("All");
              setCurrentPage(1);
            }}
          >
            All
            <span>{entries.length}</span>
          </button>
          {groups.map((group) => (
            <button
              key={group.title}
              type="button"
              aria-pressed={selectedGroup === group.title}
              onClick={() => {
                setSelectedGroup(group.title);
                setCurrentPage(1);
              }}
            >
              {group.title}
              <span>{group.resources.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="resource-library__result-line"
        role="status"
        aria-live="polite"
      >
        <span>
          {filteredEntries.length}{" "}
          {filteredEntries.length === 1 ? "reference" : "references"}
          {selectedGroup !== "All"
            ? ` in ${selectedGroup}`
            : " in the library"}
        </span>
        {activeDescription && <span>{activeDescription}</span>}
      </div>

      {filteredEntries.length ? (
        <div className="resource-library__list">
          {visibleEntries.map(({ resource, group, index }, entryIndex) => (
            <ResourceCard
              key={resource.id ?? `${group.title}-${resource.title}`}
              resource={resource}
              groupTitle={group.title}
              index={selectedGroup === "All" ? pageStart + entryIndex : index}
            />
          ))}
        </div>
      ) : (
        <div className="resource-library__empty">
          <Search size={21} aria-hidden="true" />
          <p>No resources match “{query}”.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedGroup("All");
              setCurrentPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {showPagination && (
        <nav
          className="resource-library__pagination"
          aria-label="Resource pages"
        >
          <p
            className="resource-library__pagination-summary"
            aria-live="polite"
          >
            <span>Showing</span>
            <strong>
              {pageStart + 1}–{pageEnd}
            </strong>
            <span>of {filteredEntries.length} resources</span>
          </p>

          <div className="resource-library__pagination-controls">
            <button
              className="resource-library__pagination-button"
              type="button"
              onClick={() => setCurrentPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page of resources"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span>Previous</span>
            </button>

            <span
              className="resource-library__pagination-page"
              role="status"
              aria-label={`Page ${page} of ${pageCount}`}
            >
              <span aria-hidden="true">{String(page).padStart(2, "0")}</span>
              <span aria-hidden="true">/</span>
              <span aria-hidden="true">
                {String(pageCount).padStart(2, "0")}
              </span>
            </span>

            <button
              className="resource-library__pagination-button is-next"
              type="button"
              onClick={() => setCurrentPage(page + 1)}
              disabled={page === pageCount}
              aria-label="Next page of resources"
            >
              <span>Next</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
