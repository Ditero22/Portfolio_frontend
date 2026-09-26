import PortfolioContentPage from "../../portfolioContent/components/PortfolioContentPage";

export default function SkillsPage() {
  return (
    <PortfolioContentPage
      config={{
        kind: "skills",
        number: "08",
        title: "Skills",
        eyebrow: "Frontend and backend",
        description:
          "A growing set of practical skills across user interfaces, APIs, and the systems that connect them.",
      }}
    />
  );
}
