import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

interface CardCarouselProps {
  label: string;
  children: ReactNode[];
}

export default function CardCarousel({ label, children }: CardCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const hovering = useRef(false);
  const focused = useRef(false);
  const resumeAt = useRef(0);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const step =
      (card?.getBoundingClientRect().width ?? element.clientWidth) + 16;
    const end = element.scrollWidth - element.clientWidth;
    const target =
      direction > 0 && element.scrollLeft >= end - 2
        ? 0
        : direction < 0 && element.scrollLeft <= 2
          ? end
          : element.scrollLeft + direction * step;
    element.scrollTo({
      left: target,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (
        paused ||
        reducedMotion.matches ||
        hovering.current ||
        focused.current ||
        drag.current ||
        Date.now() < resumeAt.current ||
        document.visibilityState === "hidden"
      )
        return;
      move(1);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label={`${label} carousel`}
      aria-roledescription="carousel"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-ink/45">Swipe or drag to explore</p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={
              paused ? `Play ${label} slideshow` : `Pause ${label} slideshow`
            }
            onClick={() => setPaused((value) => !value)}
            className="carousel-control"
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            aria-label={`Previous ${label}`}
            onClick={() => {
              resumeAt.current = Date.now() + 8000;
              move(-1);
            }}
            className="carousel-control"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            aria-label={`Next ${label}`}
            onClick={() => {
              resumeAt.current = Date.now() + 8000;
              move(1);
            }}
            className="carousel-control"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={track}
        tabIndex={0}
        aria-label={`Scroll ${label}`}
        className="card-carousel"
        onMouseEnter={() => {
          hovering.current = true;
        }}
        onMouseLeave={() => {
          hovering.current = false;
        }}
        onFocusCapture={() => {
          focused.current = true;
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            focused.current = false;
        }}
        onWheel={() => {
          resumeAt.current = Date.now() + 8000;
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            resumeAt.current = Date.now() + 8000;
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        onPointerDown={(event) => {
          resumeAt.current = Date.now() + 8000;
          suppressClick.current = false;
          if (event.pointerType === "mouse" && event.button === 0)
            drag.current = {
              x: event.clientX,
              left: event.currentTarget.scrollLeft,
              moved: false,
            };
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current) return;
          const distance = event.clientX - current.x;
          if (Math.abs(distance) > 5) {
            current.moved = true;
            suppressClick.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.style.scrollSnapType = "none";
            event.currentTarget.scrollLeft = current.left - distance;
          }
        }}
        onPointerUp={(event) => {
          drag.current = null;
          event.currentTarget.style.scrollSnapType = "";
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
          resumeAt.current = Date.now() + 8000;
        }}
        onPointerCancel={(event) => {
          drag.current = null;
          event.currentTarget.style.scrollSnapType = "";
          resumeAt.current = Date.now() + 8000;
        }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="card-carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${children.length}`}
          >
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
