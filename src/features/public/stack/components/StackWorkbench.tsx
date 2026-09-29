import {
  Boxes,
  Code2,
  Cpu,
  Server,
  Smartphone,
  Wrench,
} from "lucide-react";
import type { PortfolioContent } from "../../portfolioContent/types/portfolioContent";

function iconForCategory(category: string) {
  const value = category.toLowerCase();
  if (value.includes("front")) return Code2;
  if (value.includes("back")) return Server;
  if (value.includes("mobile")) return Smartphone;
  if (value.includes("tool")) return Wrench;
  if (value.includes("data") || value.includes("database")) return Boxes;
  return Cpu;
}

export default function StackWorkbench({
  items,
}: {
  items: PortfolioContent[];
}) {
  const groups = Array.from(
    items.reduce((result, item) => {
      const category = item.category?.trim() || "Other tools";
      const group = result.get(category) ?? [];
      group.push(item);
      result.set(category, group);
      return result;
    }, new Map<string, PortfolioContent[]>()),
  );

  return (
    <div className="stack-workbench">
      <div className="stack-workbench__intro">
        <span className="stack-workbench__status-dot" />
        <p>Tools in practice</p>
        <span className="stack-workbench__intro-rule" />
        <span>{items.length} selected</span>
      </div>

      <div className="stack-workbench__groups">
        {groups.map(([category, tools], groupIndex) => {
          const Icon = iconForCategory(category);

          return (
            <section
              className="stack-lane portfolio-reveal"
              key={category}
            >
              <div className="stack-lane__heading">
                <span className="stack-lane__index">0{groupIndex + 1}</span>
                <span className="stack-lane__icon">
                  <Icon
                    size={18}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h2>{category}</h2>
                  <p>{tools.length} {tools.length === 1 ? "tool" : "tools"}</p>
                </div>
              </div>

              <div className="stack-lane__tools">
                {tools.map((tool, toolIndex) => (
                  <article
                    className="stack-tool"
                    key={tool.id}
                  >
                    <span className="stack-tool__index">
                      {String(toolIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="stack-tool__copy">
                      <h3>{tool.title}</h3>
                      {tool.subtitle && <p>{tool.subtitle}</p>}
                      {tool.description && (
                        <p className="stack-tool__detail">{tool.description}</p>
                      )}
                    </div>
                    {tool.url && (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stack-tool__link"
                        aria-label={`Learn more about ${tool.title}`}
                      >
                        ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
