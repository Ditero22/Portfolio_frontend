import LandingIntro from "../components/LandingIntro";
import PortfolioPreview from "../components/PortfolioPreview";

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl pb-20">
      <LandingIntro />
      <PortfolioPreview />
    </main>
  );
}
