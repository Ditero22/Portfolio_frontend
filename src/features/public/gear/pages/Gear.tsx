import GearSection from "../components/GearSection";
import { gearSections } from "../data/gear";

export default function GearPage() {
  return (
    <main className="mx-auto w-full max-w-4xl pb-12">
      <header className="relative overflow-hidden rounded-2xl border border-ink/10 bg-surface/70 p-7 md:p-10">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-ink/10" />
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-ink/50">
          Personal toolkit
        </p>
        <h1 className="mt-3 text-5xl leading-none text-ink md:text-6xl">
          Gear
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-ink/70">
          A look at the devices that power my workflow — from my custom desktop
          and MacBook to the everyday tools I use to create, learn, and get
          things done.
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {gearSections.map((section) => (
          <GearSection
            key={section.title}
            section={section}
          />
        ))}
      </div>
    </main>
  );
}
