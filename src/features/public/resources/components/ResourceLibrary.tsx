import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import type { ResourceGroup } from "../types/resource";
import ResourceCard from "./ResourceCard";

export default function ResourceLibrary({
  groups,
}: {
  groups: ResourceGroup[];
}) {
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [query, setQuery] = useState("");

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
  const filteredEntries = entries.filter(({ resource, group }) => {
    const matchesGroup =
      selectedGroup === "All" || group.title === selectedGroup;
    const searchText = [
      resource.title,
      resource.description,
      resource.label,
      group.title,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return matchesGroup && searchText.includes(normalizedQuery);
  });
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
            onChange={(event) => setQuery(event.target.value)}
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
            onClick={() => setSelectedGroup("All")}
          >
            All
            <span>{entries.length}</span>
          </button>
          {groups.map((group) => (
            <button
              key={group.title}
              type="button"
              aria-pressed={selectedGroup === group.title}
              onClick={() => setSelectedGroup(group.title)}
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
          {filteredEntries.map(
            ({ resource, group, index }, entryIndex) => (
              <ResourceCard
                key={`${group.title}-${resource.title}`}
                resource={resource}
                groupTitle={group.title}
                index={selectedGroup === "All" ? entryIndex : index}
              />
            ),
          )}
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
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
