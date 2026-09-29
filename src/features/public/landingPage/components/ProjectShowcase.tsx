import { AppWindow, Code2, Network, Smartphone, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { Project } from "../../projects/types/project";
import { getProjectStatusLabel } from "../../projects/utils/projectStatus";
import LandingBlindArtwork from "./LandingBlindArtwork";
import LandingCardBlinds from "./LandingCardBlinds";

const categoryStyles: Record<string, { icon: LucideIcon; hue: number }> = {
  web: { icon: AppWindow, hue: 166 },
  mobile: { icon: Smartphone, hue: 208 },
  networking: { icon: Network, hue: 34 },
  software: { icon: Code2, hue: 270 },
  other: { icon: Sparkles, hue: 188 },
};

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const navigate = useNavigate();
  const landingProjects = projects.slice(0, 5);
  const cards = landingProjects.map((project, index) => {
    const category = project.category ?? "web";
    const style = categoryStyles[category] ?? categoryStyles.other;
    const categoryLabel = formatLabel(category);

    return {
      title: project.title,
      hue: style.hue,
      art: (
        <LandingBlindArtwork
          project={project}
          icon={style.icon}
          categoryLabel={categoryLabel}
          statusLabel={getProjectStatusLabel(project)}
          index={index + 1}
          onExplore={() =>
            navigate(`/projects/${encodeURIComponent(project.slug ?? project.id)}`)
          }
        />
      ),
    };
  });

  return (
    <LandingCardBlinds
      items={cards}
      label="Featured projects"
      onActivate={(index) => {
        const project = landingProjects[index];
        if (project) {
          navigate(`/projects/${encodeURIComponent(project.slug ?? project.id)}`);
        }
      }}
      autoPlayMs={3400}
    />
  );
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );
}
