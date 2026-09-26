import {
  Monitor,
  Cpu,
  Laptop,
  Smartphone,
  Watch,
  Keyboard,
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
    <article className="design-card group relative overflow-hidden rounded-2xl border border-ink/10 bg-surface p-5">
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-ink/5 bg-ink/[0.02]"
      />
      <div className="relative mb-6 flex items-center justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ink/10 bg-paper text-ink/70">
          <Icon
            size={23}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>
        <span className="max-w-[65%] rounded-full border border-ink/10 bg-paper/60 px-3 py-1.5 text-right font-mono text-[10px] text-ink/60">
          {item.detail}
        </span>
      </div>
      <h3 className="relative text-2xl text-ink">{item.name}</h3>
      <p className="mt-3 text-sm leading-6 text-ink/65">{item.note}</p>
      <div
        aria-hidden="true"
        className="mt-6 flex items-center gap-1"
      >
        <span className="h-1 w-8 rounded-full bg-teal-500/60" />
        <span className="h-1 w-2 rounded-full bg-ink/15" />
        <span className="h-1 w-2 rounded-full bg-ink/10" />
      </div>
    </article>
  );
}
