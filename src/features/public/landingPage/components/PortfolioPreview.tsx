import CardCarousel from "@/shared/components/ui/CardCarousel";
import ProjectShowcase from "./ProjectShowcase";
import { ArrowUpRight, Layers3, Monitor, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { usePortfolioPreview } from "../hooks/usePortfolioPreview";
import { gearSections } from "../../gear/data/gear";
import { resourceGroups } from "../../resources/data/resources";
import GearCard from "../../gear/components/GearCard";
import ResourceCard from "../../resources/components/ResourceCard";
import ExperiencePreview from "./ExperiencePreview";

function SectionHeading({
  number,
  title,
  href,
  children,
}: {
  number: string;
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
          {number} / Explore
        </p>
        <h2 className="text-4xl text-ink">{title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-ink/60">
          {children}
        </p>
      </div>
      <Link
        to={href}
        className="group flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-ink/70 transition-colors hover:bg-ink hover:text-paper"
      >
        All {title}
        <ArrowUpRight
          size={14}
          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
        />
      </Link>
    </header>
  );
}

export default function PortfolioPreview() {
  const { projects, experience, loading, unavailable } = usePortfolioPreview();
  return (
    <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
      <section className="portfolio-reveal">
        <SectionHeading
          number="01"
          title="Projects"
          href="/projects"
        >
          Ideas taking shape through code, thoughtful interfaces, and hands-on
          learning.
        </SectionHeading>
        {loading || unavailable.projects || !projects.length ? (
          <div className="rounded-2xl border border-dashed border-ink/20 bg-surface p-8 text-ink/60">
            <Layers3
              size={26}
              className="mb-4"
            />
            <p>
              {loading
                ? "Loading selected projects…"
                : unavailable.projects
                  ? "Projects are temporarily unavailable."
                  : "New work will appear here as it is published."}
            </p>
          </div>
        ) : (
          <ProjectShowcase
            key={projects
              .slice(0, 3)
              .map((project) => project.id)
              .join(":")}
            projects={projects.slice(0, 3)}
          />
        )}
      </section>
      <section className="portfolio-reveal">
        <SectionHeading
          number="02"
          title="Experience"
          href="/experience"
        >
          The teams, challenges, and contributions that shape how I build.
        </SectionHeading>
        {experience.length > 0 && !unavailable.experience ? (
          <ExperiencePreview entries={experience} />
        ) : (
          <div className="rounded-2xl border border-ink/10 bg-surface p-7 text-sm text-ink/60">
            {loading
              ? "Loading experience…"
              : unavailable.experience
                ? "Experience is temporarily unavailable."
                : "My professional journey will appear here as experience is published."}
          </div>
        )}
      </section>
      <section className="portfolio-reveal">
        <SectionHeading
          number="03"
          title="Gear"
          href="/gear"
        >
          A small look at the tools behind the work. Built for focus, creating,
          and everyday use.
        </SectionHeading>
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/45">
          <Monitor size={14} /> From my desk
        </div>
        <CardCarousel label="Gear">
          {gearSections
            .flatMap((section) => section.items)
            .map((item) => (
              <GearCard
                key={item.name}
                item={item}
              />
            ))}
        </CardCarousel>
      </section>
      <section className="portfolio-reveal">
        <SectionHeading
          number="04"
          title="Resources"
          href="/resources"
        >
          Good references make the next step easier. A few bookmarks from my
          learning shelf.
        </SectionHeading>
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/45">
          <BookOpen size={14} /> Always learning
        </div>
        <CardCarousel label="Resources">
          {resourceGroups
            .flatMap((group) => group.resources)
            .map((resource) => (
              <ResourceCard
                key={resource.title}
                resource={resource}
              />
            ))}
        </CardCarousel>
      </section>
    </div>
  );
}
