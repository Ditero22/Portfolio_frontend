import PortfolioContentPage from "../../portfolioContent/components/PortfolioContentPage";

export default function StackPage() {
  return (
    <PortfolioContentPage
      config={{
        kind: "stack",
        number: "05",
        title: "Stack",
        eyebrow: "Tools I use",
        description:
          "The technologies and tools I reach for while building web and mobile experiences.",
      }}
    />
  );
}
