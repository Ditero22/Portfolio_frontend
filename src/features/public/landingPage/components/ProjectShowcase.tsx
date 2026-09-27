import { useRef, useState } from "react";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../../projects/types/project";

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const centerIndex = projects.length === 3 ? 1 : 0;
  const [slots, setSlots] = useState(() =>
    projects.map((project) => project.id),
  );
  const pointerStartRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);
  const touchStartRef = useRef<{ identifier: number; x: number; y: number } | null>(
    null,
  );
  const suppressClickUntilRef = useRef(0);
  const wheelCooldownRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const centeredId = slots[centerIndex];

  function selectProject(id: string) {
    setSlots((current) => {
      const index = current.indexOf(id);
      if (index < 0 || index === centerIndex) return current;
      const next = [...current];
      [next[index], next[centerIndex]] = [next[centerIndex], next[index]];
      return next;
    });
  }

  function selectAdjacentProject(direction: -1 | 1) {
    if (projects.length < 2) return;

    setSlots((current) => {
      const adjacentSlot = centerIndex + direction;
      const adjacentId =
        current[adjacentSlot] ??
        current.find((projectId) => projectId !== current[centerIndex]);
      const adjacentIndex = current.indexOf(adjacentId ?? "");
      if (adjacentIndex < 0) return current;

      const next = [...current];
      [next[adjacentIndex], next[centerIndex]] = [
        next[centerIndex],
        next[adjacentIndex],
      ];
      return next;
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;

    handleSwipe(event.clientX - start.x, event.clientY - start.y);
  }

  function handleSwipe(deltaX: number, deltaY: number) {
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2)
      return;

    suppressClickUntilRef.current = Date.now() + 400;
    selectAdjacentProject(deltaX < 0 ? 1 : -1);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = {
      identifier: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = Array.from(event.changedTouches).find(
      (item) => item.identifier === start.identifier,
    );
    if (!touch) return;

    handleSwipe(touch.clientX - start.x, touch.clientY - start.y);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    wheelDeltaRef.current += event.deltaX;
    if (Math.abs(wheelDeltaRef.current) < 32) return;

    event.preventDefault();
    const direction = wheelDeltaRef.current > 0 ? 1 : -1;
    wheelDeltaRef.current = 0;
    if (Date.now() < wheelCooldownRef.current) return;

    wheelCooldownRef.current = Date.now() + 550;
    selectAdjacentProject(direction);
  }

  return (
    <div
      className={`project-fan relative ${
        projects.length === 3 ? "project-fan--layered" : ""
      }`}
      role="region"
      aria-label="Featured projects"
      aria-roledescription="carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        touchStartRef.current = null;
      }}
      onPointerDown={(event) => {
        if (
          projects.length < 2 ||
          !event.isPrimary ||
          event.pointerType !== "pen"
        ) {
          return;
        }

        pointerStartRef.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStartRef.current = null;
      }}
      onWheel={handleWheel}
      onClickCapture={(event) => {
        if (Date.now() > suppressClickUntilRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClickUntilRef.current = 0;
      }}
    >
      {projects.map((project, index) => {
        const active = project.id === centeredId;
        return (
          <article
            key={project.id}
            data-slot={slots.indexOf(project.id)}
            data-active={active}
            className={`project-fan-card group relative flex flex-col overflow-hidden rounded-2xl border border-ink/15 bg-surface p-6 text-ink shadow-xl shadow-black/10 ${active ? "project-border-light" : ""}`}
          >
            {!active && (
              <button
                type="button"
                onClick={() => selectProject(project.id)}
                aria-label={`Show ${project.title} in the center`}
                className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-teal-500"
              />
            )}
            <div className="mb-7 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 font-mono text-[9px] uppercase tracking-wider">
                  {project.category ?? "web"}
                </span>
                <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-ink/50">
                  {project.role}
                </span>
              </div>
              <span className="font-mono text-xs text-ink/35">
                0{index + 1}
              </span>
            </div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/10 bg-ink/5">
              <Code2
                size={24}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-3xl leading-tight">{project.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/60">
              {project.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.stack.slice(0, 3).map((stack) => (
                <span
                  key={stack}
                  className="rounded border border-ink/10 px-2 py-1 text-[10px] text-ink/60"
                >
                  {stack}
                </span>
              ))}
            </div>
            <div className="mt-auto min-h-16 pt-4">
              {active && (
                <Link
                  to="/projects"
                  className="flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/70 focus-visible:outline-2 focus-visible:outline-teal-500"
                >
                  <span>Explore project</span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </article>
        );
      })}
      <p
        className="sr-only"
        aria-live="polite"
      >
        Selected project:{" "}
        {projects.find((project) => project.id === centeredId)?.title}
      </p>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center font-mono text-[9px] uppercase tracking-widest text-ink/40 sm:hidden">
        Swipe to switch projects
      </p>
    </div>
  );
}
