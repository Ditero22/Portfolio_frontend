import LandingIntro from "../components/LandingIntro";
import PortfolioPreview from "../components/PortfolioPreview";

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-1 pb-20 pt-10 md:pt-16">
      <LandingIntro />
      <PortfolioPreview />
    </main>
  );
}
