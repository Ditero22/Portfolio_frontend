import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Experience } from "../../experience/types/experience";
import { experiencePeriod } from "../../experience/utils/experiencePeriod";

export default function ExperiencePreview({
  entries,
}: {
  entries: Experience[];
}) {
  return (
    <ol
      className="relative space-y-3 border-l border-ink/15 pl-5 sm:pl-7"
      aria-label="Experience highlights"
    >
      {entries.slice(0, 3).map((item, index) => (
        <li
          key={item.id}
          className="relative"
        >
          <span
            aria-hidden="true"
            className="absolute -left-[26px] top-7 h-2.5 w-2.5 rounded-full border-2 border-surface bg-teal-500 ring-4 ring-paper sm:-left-[34px]"
          />
          <Link
            to="/experience"
            aria-label={`Read about ${item.role} at ${item.company}`}
            className="group grid gap-3 rounded-xl border border-ink/10 bg-surface p-4 text-ink transition duration-300 hover:border-teal-500/35 hover:bg-teal-500/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 motion-safe:hover:translate-x-1 sm:grid-cols-[1fr_auto] sm:p-5 motion-reduce:transition-none"
          >
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink/50">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span aria-hidden="true">/</span>
                <span>{experiencePeriod(item)}</span>
                {!item.endDate && (
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-ink/75">
                    Current
                  </span>
                )}
              </div>
              <h3 className="break-words text-2xl leading-tight">
                {item.role}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/65">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Building2
                    size={13}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span className="break-words">{item.company}</span>
                </span>
                {item.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin
                      size={13}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    {item.location}
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-ink/55">
                {item.description}
              </p>
            </div>
            <span className="flex items-center gap-2 self-center text-xs text-ink/60 sm:ml-3">
              <span className="sm:sr-only">View experience</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 transition-colors group-hover:border-teal-500/30 group-hover:bg-teal-500/10">
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
