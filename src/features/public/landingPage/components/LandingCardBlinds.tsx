import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";

export type LandingBlindItem = {
  title: string;
  hue?: number;
  art: ReactNode;
};

export default function LandingCardBlinds({
  items,
  label,
  onActivate,
  autoPlayMs = 3400,
}: {
  items: LandingBlindItem[];
  label: string;
  onActivate: (index: number) => void;
  autoPlayMs?: number | false;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(340);
  const [stageHeight, setStageHeight] = useState(560);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const selectedIndex = items.length ? activeIndex % items.length : 0;

  const goTo = useCallback(
    (index: number) => {
      if (!items.length) return;
      setActiveIndex((index + items.length) % items.length);
    },
    [items.length],
  );

  const goNext = useCallback(() => goTo(selectedIndex + 1), [selectedIndex, goTo]);
  const goPrevious = useCallback(
    () => goTo(selectedIndex - 1),
    [selectedIndex, goTo],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const observer =
      stage && "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
            threshold: 0.2,
          })
        : null;
    const resizeObserver =
      stage && "ResizeObserver" in window
        ? new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;
            const isPhone = width <= 640;
            const nextCardWidth = isPhone
              ? Math.min(Math.max(200, width * 0.8), 340)
              : Math.min(Math.max(300, width * 0.39), 390);
            setCardWidth(nextCardWidth);
            setStageHeight(
              Math.ceil((nextCardWidth * 10) / 7 + (isPhone ? 72 : 82)),
            );
          })
        : null;
    const updateMotion = () => setReducedMotion(motionPreference.matches);

    if (stage && observer) observer.observe(stage);
    else setIsVisible(true);
    if (stage && resizeObserver) resizeObserver.observe(stage);
    updateMotion();
    motionPreference.addEventListener("change", updateMotion);

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      motionPreference.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (
      autoPlayMs === false ||
      !isVisible ||
      isPaused ||
      reducedMotion ||
      items.length < 2
    ) {
      return;
    }
    const timer = window.setInterval(goNext, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [autoPlayMs, goNext, isPaused, isVisible, items.length, reducedMotion]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      (event.target as HTMLElement).closest(
        ".landing-card-blinds__arrow, .landing-card-blinds__dot",
      )
    ) {
      return;
    }
    dragStartRef.current = event.clientX;
    didSwipeRef.current = false;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    const distance = event.clientX - dragStartRef.current;
    dragStartRef.current = null;
    if (Math.abs(distance) < 44) return;

    didSwipeRef.current = true;
    if (distance < 0) goNext();
    else goPrevious();
    window.setTimeout(() => {
      didSwipeRef.current = false;
    }, 0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    }
  };

  if (!items.length) return null;

  return (
    <div
      ref={stageRef}
      className="landing-card-blinds"
      style={{ height: `${stageHeight}px` }}
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragStartRef.current = null;
      }}
      onClickCapture={(event) => {
        if (!didSwipeRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        didSwipeRef.current = false;
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="landing-card-blinds__glow" aria-hidden="true" />
      {items.map((item, index) => {
        let distance = index - selectedIndex;
        if (items.length > 2) {
          if (distance > items.length / 2) distance -= items.length;
          if (distance < -items.length / 2) distance += items.length;
        }
        const depth = Math.abs(distance);
        const direction = Math.sign(distance);
        const offset = depth === 0 ? 0 : direction * (depth === 1 ? 0.86 : 1.58);
        const rotation = -direction * (depth === 1 ? 8 : 13);
        const scale = depth === 0 ? 1 : depth === 1 ? 0.84 : 0.72;
        const opacity = depth === 0 ? 1 : depth === 1 ? 0.66 : 0.34;
        const isActive = index === selectedIndex;
        const art = isValidElement<{ interactive?: boolean }>(item.art)
          ? cloneElement(item.art, { interactive: isActive })
          : item.art;

        return (
          <article
            key={`${item.title}-${index}`}
            className={`landing-card-blinds__card${isActive ? " is-active" : ""}`}
            style={{
              width: `${cardWidth}px`,
              height: `${(cardWidth * 10) / 7}px`,
              transform: `translate(calc(-50% + ${offset * 100}%), -50%) rotateY(${rotation}deg) scale(${scale})`,
              opacity,
              zIndex: 10 - depth,
              pointerEvents: depth <= 1 ? "auto" : "none",
              "--hue": item.hue ?? 166,
              "--project-hue": item.hue ?? 166,
            } as CSSProperties}
            aria-hidden={!isActive}
            role="group"
            tabIndex={-1}
            aria-label={`${item.title}, ${index + 1} of ${items.length}`}
            aria-roledescription="slide"
            onClick={() => {
              if (!isActive) goTo(index);
              else onActivate(index);
            }}
          >
            {art}
          </article>
        );
      })}

      {items.length > 1 && (
        <>
          <button
            className="landing-card-blinds__arrow landing-card-blinds__arrow--previous"
            type="button"
            aria-label="Previous project"
            onClick={goPrevious}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            className="landing-card-blinds__arrow landing-card-blinds__arrow--next"
            type="button"
            aria-label="Next project"
            onClick={goNext}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

          <div className="landing-card-blinds__pagination" aria-label="Choose project">
            <span className="landing-card-blinds__count">
              {String(selectedIndex + 1).padStart(2, "0")}
              <span>/</span>
              {String(items.length).padStart(2, "0")}
            </span>
            <div className="landing-card-blinds__dots" role="group" aria-label="Projects">
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  className={`landing-card-blinds__dot${index === selectedIndex ? " is-active" : ""}`}
                  aria-label={`Show ${item.title}`}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
            <span className="landing-card-blinds__hint" aria-hidden="true">
              SWIPE TO EXPLORE
            </span>
          </div>
        </>
      )}
    </div>
  );
}
