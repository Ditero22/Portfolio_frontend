import type { Experience } from "../types/experience";

export function experiencePeriod(item: Experience) {
  const format = (value: string) =>
    new Date(`${value}-01T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  return `${format(item.startDate)} – ${item.endDate ? format(item.endDate) : "Present"}`;
}
