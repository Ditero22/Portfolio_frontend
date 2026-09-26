import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import type { Experience } from "../types/experience";
import { experiencePeriod } from "../utils/experiencePeriod";

export default function ExperienceCard({ item }: { item: Experience }) {
  return (
    <article className="relative isolate overflow-hidden rounded-2xl border border-ink/15 bg-surface text-ink shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-teal-500/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-teal-500/5 blur-3xl"
      />

      <div className="p-5 sm:p-7">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:justify-between">
          <div className="flex w-full min-w-0 items-start gap-3 lg:flex-1">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/10 text-ink/80"
            >
              <BriefcaseBusiness
                size={20}
                strokeWidth={1.5}
              />
            </span>
            <div className="min-w-0">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                Experience
              </p>
              <h2 className="break-words text-2xl leading-tight sm:text-3xl">
                {item.role}
              </h2>
            </div>
          </div>
          <div className="flex max-w-full shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-paper/60 px-3 py-2 text-xs text-ink/70 lg:ml-auto">
            <CalendarDays
              size={14}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>{experiencePeriod(item)}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-ink/10 pb-5 text-sm">
          <p className="flex items-center gap-2 font-medium text-ink/85">
            <Building2
              size={15}
              className="shrink-0 text-ink/45"
              aria-hidden="true"
            />
            {item.company}
          </p>
          {item.location && (
            <p className="flex items-center gap-2 text-ink/60">
              <MapPin
                size={15}
                className="shrink-0"
                aria-hidden="true"
              />
              {item.location}
            </p>
          )}
          {!item.endDate && (
            <span className="flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-2.5 py-1 text-xs text-ink/80">
              <span
                className="h-1.5 w-1.5 rounded-full bg-teal-500"
                aria-hidden="true"
              />
              Current role
            </span>
          )}
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-ink/70">
          {item.description}
        </p>

        {item.highlights.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg tracking-wide text-ink/80">
              Key contributions
            </h3>
            <ul className="mt-3 space-y-2">
              {item.highlights.map((text, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-ink/5 bg-paper/40 px-3 py-3 text-sm leading-6 text-ink/75"
                >
                  <ArrowUpRight
                    size={16}
                    className="mt-1 shrink-0 text-ink/45"
                    aria-hidden="true"
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
