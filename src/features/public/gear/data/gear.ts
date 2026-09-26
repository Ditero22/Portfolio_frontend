import type { GearSection } from "../types/gear";

export const gearSections: GearSection[] = [
  {
    title: "Desk setup",
    eyebrow: "The machine I build on",
    items: [
      {
        name: "Custom desktop",
        detail: "Ryzen 7 5700X · RTX 4060",
        note: "My main workstation for development, projects, and heavier creative work.",
      },
      {
        name: "ASRock B550 Pro SE",
        detail: "32 GB · 3200 MHz RAM",
        note: "Reliable everyday platform with room to work across several apps at once.",
      },
      {
        name: "SSD storage",
        detail: "2 TB + 250 GB",
        note: "Fast storage for code, project files, and media.",
      },
      {
        name: "Attack Shark mechanical keyboard",
        detail: "Mechanical",
        note: "My daily keyboard for long development sessions.",
      },
    ],
  },
  {
    title: "Everyday carry",
    eyebrow: "Always within reach",
    items: [
      {
        name: "iPhone 13",
        detail: "Mobile",
        note: "My everyday phone for communication, photos, and testing mobile layouts.",
      },
      {
        name: "Apple Watch",
        detail: "Series 11",
        note: "For quick notifications, activity tracking, and staying connected away from my desk.",
      },
    ],
  },
  {
    title: "Create anywhere",
    eyebrow: "Portable workspace",
    items: [
      {
        name: "MacBook Pro",
        detail: "M5 Pro",
        note: "My portable setup for writing, building, and shipping work wherever I am.",
      },
    ],
  },
];
