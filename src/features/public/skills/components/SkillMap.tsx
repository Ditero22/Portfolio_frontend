import { Code2, Layers3, Network, Plus, Server, Sparkles } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/shared/components/ui";
import type { PortfolioContent } from "../../portfolioContent/types/portfolioContent";

interface SkillGroup {
  title: string;
  items: PortfolioContent[];
}

const groupIcons = {
  Frontend: Code2,
  Backend: Server,
  Networking: Network,
  "Other skills": Sparkles,
} as const;

export default function SkillMap({ items }: { items: PortfolioContent[] }) {
  const [selectedSkill, setSelectedSkill] =
    useState<PortfolioContent | null>(null);
  const groups: SkillGroup[] = [
    {
      title: "Frontend",
      items: items.filter(
        (item) => item.category?.toLowerCase() === "frontend",
      ),
    },
    {
      title: "Backend",
      items: items.filter(
        (item) => item.category?.toLowerCase() === "backend",
      ),
    },
    {
      title: "Networking",
      items: items.filter(
        (item) => item.category?.toLowerCase() === "networking",
      ),
    },
    {
      title: "Other skills",
      items: items.filter(
        (item) =>
          !["frontend", "backend", "networking"].includes(
            item.category?.toLowerCase() ?? "",
          ),
      ),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="skill-map">
      {groups.map((group, groupIndex) => {
        const Icon =
          groupIcons[group.title as keyof typeof groupIcons] ?? Layers3;

        return (
          <section
            className="skill-map-group portfolio-reveal"
            key={group.title}
          >
            <div className="skill-map-group__heading">
              <span className="skill-map-group__index">0{groupIndex + 1}</span>
              <span className="skill-map-group__icon">
                <Icon
                  size={18}
                  aria-hidden="true"
                />
              </span>
              <div>
                <h2>{group.title}</h2>
                <p>
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "skill" : "skills"}
                </p>
              </div>
            </div>

            <div className="skill-map-group__items">
              {group.items.map((item, itemIndex) => (
                <article
                  className="skill-map-item"
                  key={item.id}
                >
                  <span className="skill-map-item__index">
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="skill-map-item__copy">
                    <span className="skill-map-item__title">{item.title}</span>
                    {item.subtitle && (
                      <span className="skill-map-item__subtitle">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="skill-map-item__toggle"
                    onClick={() => setSelectedSkill(item)}
                    aria-label={`View ${item.title} details`}
                    title={`View ${item.title} details`}
                  >
                    <Plus size={15} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <Modal
        isOpen={selectedSkill !== null}
        onClose={() => setSelectedSkill(null)}
        title={selectedSkill?.title ?? "Skill details"}
        size="md"
      >
        {selectedSkill && (
          <div className="space-y-3 text-ink">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
              {selectedSkill.category ?? "Skill"}
            </p>
            {selectedSkill.subtitle && (
              <p className="text-sm font-medium text-ink/80">
                {selectedSkill.subtitle}
              </p>
            )}
            {selectedSkill.description && (
              <p className="text-sm leading-7 text-ink/65">
                {selectedSkill.description}
              </p>
            )}
            {selectedSkill.url && (
              <a
                href={selectedSkill.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-ink/75 underline-offset-4 hover:text-ink hover:underline"
              >
                Learn more
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
