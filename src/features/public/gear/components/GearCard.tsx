import {
  Cpu,
  Keyboard,
  Laptop,
  Monitor,
  Smartphone,
  Watch,
} from "lucide-react";
import type { GearItem } from "../types/gear";

export default function GearCard({ item }: { item: GearItem }) {
  const name = item.name.toLowerCase();
  const Icon = name.includes("macbook")
    ? Laptop
    : name.includes("iphone")
      ? Smartphone
      : name.includes("watch")
        ? Watch
        : name.includes("keyboard")
          ? Keyboard
          : name.includes("desktop")
            ? Monitor
            : Cpu;

  return (
    <article className="gear-inventory-card group">
      <div aria-hidden="true" className="gear-inventory-card__glow" />
      <div className="gear-inventory-card__topline">
        <span className="gear-inventory-card__icon">
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="gear-inventory-card__detail">{item.detail}</span>
      </div>
      <p className="gear-inventory-card__label">Hardware / daily setup</p>
      <h3>{item.name}</h3>
      <p className="gear-inventory-card__note">{item.note}</p>
      <div className="gear-inventory-card__footer" aria-hidden="true">
        <span>In rotation</span>
        <span className="gear-inventory-card__signal">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    </article>
  );
}
