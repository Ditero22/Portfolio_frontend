import { Network, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import type { Project } from "../types/project";

const zoomSteps = [100, 125, 150, 200, 250] as const;

export default function NetworkLab({ project }: { project: Project }) {
  const [zoom, setZoom] = useState<(typeof zoomSteps)[number]>(100);
  const [activeTechnology, setActiveTechnology] = useState<string | null>(null);
  const topology = project.coverImageUrl || project.images?.[0];
  const notes = activeTechnology
    ? project.highlights.filter((highlight) =>
        highlight.toLowerCase().includes(activeTechnology.toLowerCase()),
      )
    : project.highlights;

  function changeZoom(direction: -1 | 1) {
    const currentIndex = zoomSteps.indexOf(zoom);
    const nextIndex = Math.max(
      0,
      Math.min(zoomSteps.length - 1, currentIndex + direction),
    );
    setZoom(zoomSteps[nextIndex]);
  }

  return (
    <section
      aria-labelledby="network-lab-title"
      className="overflow-hidden rounded-2xl border border-ink/15 bg-surface"
    >
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 p-5 sm:p-6">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            <Network size={14} aria-hidden="true" />
            Interactive project view
          </p>
          <h2 id="network-lab-title" className="text-2xl text-ink">
            Network lab
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Explore the topology and select a technology to find the related
            implementation notes.
          </p>
        </div>
        {topology && (
          <div
            role="group"
            aria-label="Topology image zoom controls"
            className="flex items-center gap-2"
          >
            <button
              type="button"
              aria-label="Zoom out topology"
              onClick={() => changeZoom(-1)}
              disabled={zoom === zoomSteps[0]}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:border-teal-500/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ZoomOut size={16} aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="min-w-12 text-center font-mono text-xs text-ink/60"
            >
              {zoom}%
            </span>
            <button
              type="button"
              aria-label="Zoom in topology"
              onClick={() => changeZoom(1)}
              disabled={zoom === zoomSteps[zoomSteps.length - 1]}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:border-teal-500/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ZoomIn size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Reset topology zoom"
              onClick={() => setZoom(100)}
              disabled={zoom === 100}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:border-teal-500/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      {topology ? (
        <figure className="border-b border-ink/10 bg-paper/40">
          <div
            className="max-h-[70vh] overflow-auto overscroll-contain p-3 sm:p-5"
            aria-label="Scrollable network topology"
          >
            <img
              src={topology}
              alt={`${project.title} network topology`}
              className="mx-auto h-auto rounded-xl border border-ink/10 bg-surface"
              style={{
                width: `${zoom}%`,
                maxWidth: "none",
                minWidth: "100%",
              }}
            />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-ink/45 sm:px-6">
            <span>Topology · scroll to inspect at higher zoom</span>
            <span>{project.status ?? "completed"}</span>
          </figcaption>
        </figure>
      ) : (
        <div className="border-b border-ink/10 bg-paper/40 p-6 text-sm text-ink/55">
          No topology image has been added to this project yet.
        </div>
      )}

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-ink/50">
            Technologies
          </h3>
          <div
            role="group"
            aria-label="Filter network notes by technology"
            className="mt-3 flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={activeTechnology === null}
              onClick={() => setActiveTechnology(null)}
              className={`rounded-full border px-3 py-2 font-mono text-[10px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${activeTechnology === null ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:border-ink/35"}`}
            >
              All
            </button>
            {project.stack.map((technology) => {
              const active = activeTechnology === technology;
              return (
                <button
                  key={technology}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setActiveTechnology(active ? null : technology)
                  }
                  className={`rounded-full border px-3 py-2 font-mono text-[10px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${active ? "border-teal-600 bg-teal-600 text-white" : "border-ink/15 text-ink/60 hover:border-teal-500/50 hover:text-ink"}`}
                >
                  {technology}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-ink/50">
            Notes can be updated from the project editor by adding technologies
            and one implementation detail per highlight.
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-ink/50">
            Implementation notes
          </h3>
          {notes.length > 0 ? (
            <ol className="mt-3 space-y-2">
              {notes.map((note, index) => (
                <li
                  key={`${index}-${note}`}
                  className="flex gap-3 rounded-xl border border-ink/10 bg-paper/50 p-3 text-sm leading-6 text-ink/70"
                >
                  <span className="font-mono text-xs text-teal-700 dark:text-teal-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {note}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-ink/15 p-4 text-sm leading-6 text-ink/55">
              No implementation note mentions “{activeTechnology}” yet. Add a
              matching highlight in the project editor to document it here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
