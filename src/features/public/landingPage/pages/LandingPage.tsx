import LandingIntro from "../components/LandingIntro";
import PortfolioPreview from "../components/PortfolioPreview";

export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-20">
      <LandingIntro />
      <PortfolioPreview />
    </div>
  );
}
