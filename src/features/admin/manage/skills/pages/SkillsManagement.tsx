import PortfolioContentManagement from "../../portfolioContent/components/PortfolioContentManagement";
import skillData from "@/features/public/skills/data/skillData";

export default function SkillsManagement() {
  return (
    <PortfolioContentManagement
      config={{
        kind: "skills",
        title: "Skills",
        singular: "Skill",
        description:
          "Organize your strengths into clear Frontend and Backend groups.",
        titleLabel: "Skill",
        subtitleLabel: "Experience level (optional)",
        descriptionLabel: "Notes or examples (optional)",
        categoryLabel: "Skill area",
        sampleData: skillData,
      }}
    />
  );
}
