import PortfolioContentManagement from "../../portfolioContent/components/PortfolioContentManagement";
import stackData from "@/features/public/stack/data/stackData";

export default function StackManagement() {
  return (
    <PortfolioContentManagement
      config={{
        kind: "stack",
        title: "Stack",
        singular: "Tool",
        description: "Manage the technologies shown on your public Stack page.",
        titleLabel: "Technology or tool",
        subtitleLabel: "Level or short label",
        descriptionLabel: "How you use it",
        categoryLabel: "Category (Frontend, Backend, Mobile, Tools, etc.)",
        sampleData: stackData,
      }}
    />
  );
}
