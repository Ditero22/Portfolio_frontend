import PortfolioContentPage from "../../portfolioContent/components/PortfolioContentPage";

export default function RecommendationsPage() {
  return (
    <PortfolioContentPage
      config={{
        kind: "recommendations",
        number: "08",
        title: "Recommendations",
        eyebrow: "Words from others",
        description:
          "Feedback from people I have learned from and worked alongside.",
      }}
    />
  );
}
