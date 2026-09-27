import { Code2, Layers3, Server, Sparkles } from "lucide-react";
import type { PortfolioContent } from "../../portfolioContent/types/portfolioContent";

interface SkillGroup {
  title: string;
  items: PortfolioContent[];
}

const groupIcons = {
  Frontend: Code2,
  Backend: Server,
  "Other skills": Sparkles,
} as const;

export default function SkillMap({ items }: { items: PortfolioContent[] }) {
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
      title: "Other skills",
      items: items.filter(
        (item) =>
          !["frontend", "backend"].includes(
            item.category?.toLowerCase() ?? "",
          ),
      ),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="skill-map">
      {groups.map((group, groupIndex) => {
        const Icon = groupIcons[group.title as keyof typeof groupIcons] ?? Layers3;

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
                  {group.items.length} {group.items.length === 1 ? "skill" : "skills"}
                </p>
              </div>
            </div>

            <div className="skill-map-group__items">
              {group.items.map((item, itemIndex) => (
                <details
                  className="skill-map-item"
                  key={item.id}
                >
                  <summary>
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
                    <span
                      className="skill-map-item__toggle"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  {item.description && (
                    <p className="skill-map-item__description">
                      {item.description}
                    </p>
                  )}
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
