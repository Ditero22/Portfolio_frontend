import { Cpu, Layers3, Monitor } from "lucide-react";
import { useState } from "react";

import GearSection from "../components/GearSection";
import { gearSections } from "../data/gear";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function GearPage() {
  const [selectedSetup, setSelectedSetup] = useState("All setups");
  const totalDevices = gearSections.reduce(
    (count, section) => count + section.items.length,
    0,
  );
  const visibleSections =
    selectedSetup === "All setups"
      ? gearSections
      : gearSections.filter((section) => section.title === selectedSetup);

  return (
    <PublicPageFrame
      number="03"
      eyebrow="Personal toolkit"
      title="Gear"
      description="A look at the devices that power my workflow — from my custom desktop and MacBook to the everyday tools I use to create, learn, and get things done."
    >
      <div className="gear-dashboard">
        <section className="gear-dashboard__overview" aria-label="Gear overview">
          <div className="gear-dashboard__intro">
            <span className="gear-dashboard__eyebrow">
              <Monitor size={14} aria-hidden="true" /> WORKSPACE / INVENTORY
            </span>
            <h2>My setup, at a glance.</h2>
            <p>
              A few of the devices I use to build, test, and stay connected.
            </p>
          </div>
          <div className="gear-dashboard__stats">
            <div>
              <Cpu size={16} aria-hidden="true" />
              <strong>{String(totalDevices).padStart(2, "0")}</strong>
              <span>devices</span>
            </div>
            <div>
              <Layers3 size={16} aria-hidden="true" />
              <strong>{String(gearSections.length).padStart(2, "0")}</strong>
              <span>setups</span>
            </div>
          </div>
        </section>

        <div
          className="gear-setup-filter"
          role="group"
          aria-label="Filter gear by setup"
        >
          <span className="gear-setup-filter__label">Browse setups</span>
          <button
            type="button"
            aria-pressed={selectedSetup === "All setups"}
            onClick={() => setSelectedSetup("All setups")}
          >
            All setups
            <span>{String(totalDevices).padStart(2, "0")}</span>
          </button>
          {gearSections.map((section, index) => (
            <button
              key={section.title}
              type="button"
              aria-pressed={selectedSetup === section.title}
              onClick={() => setSelectedSetup(section.title)}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </button>
          ))}
        </div>

        <div className="gear-setup-list">
          {visibleSections.map((section) => (
            <GearSection
              key={section.title}
              section={section}
              index={gearSections.indexOf(section)}
            />
          ))}
        </div>
      </div>
    </PublicPageFrame>
  );
}
