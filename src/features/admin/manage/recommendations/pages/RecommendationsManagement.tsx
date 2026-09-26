import PortfolioContentManagement from "../../portfolioContent/components/PortfolioContentManagement";
import recommendationData from "@/features/public/recommendations/data/recommendationData";

export default function RecommendationsManagement() {
  return (
    <PortfolioContentManagement
      config={{
        kind: "recommendations",
        title: "Recommendations",
        singular: "Recommendation",
        description:
          "Manage testimonials and recommendations for your portfolio.",
        titleLabel: "Recommender name",
        subtitleLabel: "Role or organization",
        descriptionLabel: "Recommendation text",
        categoryLabel: "Context (optional)",
        sampleData: recommendationData,
      }}
    />
  );
}
