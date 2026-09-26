import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Resource } from "../types/resource";

export default function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noopener noreferrer"
      className="resource-border-light design-card group flex flex-col rounded-2xl border border-ink/10 bg-surface p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-ink/75">
          <BookOpen
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>
        <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/55">
          {resource.label}
        </span>
      </div>
      <h3 className="text-2xl text-ink">{resource.title}</h3>
      <p className="mb-6 mt-3 text-sm leading-6 text-ink/65">
        {resource.description}
      </p>
      <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/55">
        <span>Open resource</span>
        <ArrowUpRight
          size={17}
          aria-hidden="true"
          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
        />
      </div>
    </a>
  );
}
