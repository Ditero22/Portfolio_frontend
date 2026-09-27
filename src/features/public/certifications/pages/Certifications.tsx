import PortfolioContentPage from "../../portfolioContent/components/PortfolioContentPage";

export default function CertificationsPage() {
  return (
    <PortfolioContentPage
      config={{
        kind: "certifications",
        number: "07",
        title: "Certifications",
        eyebrow: "Learning milestones",
        description:
          "Courses and credentials that mark the skills I have practiced and the subjects I continue to explore.",
      }}
    />
  );
}
