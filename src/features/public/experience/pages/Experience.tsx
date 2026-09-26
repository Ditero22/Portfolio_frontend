import { useEffect, useState } from "react";

import {
  getExperience,
  experienceChangedEvent,
} from "../services/experience.service";
import type { Experience } from "../types/experience";
import ExperienceCard from "../components/ExperienceCard";
import { publicApiRefreshIntervalMs } from "@/shared/api";

export default function ExperiencePage() {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let request: AbortController | null = null;
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      request?.abort();
      const controller = new AbortController();
      request = controller;
      try {
        const data = await getExperience(controller.signal);
        if (active && !controller.signal.aborted) {
          setExperience(
            data.filter(
              (experience) => experience.published && !experience.deletedAt,
            ),
          );
          setError(false);
        }
      } catch {
        if (active && !controller.signal.aborted) setError(true);
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
        if (request === controller) request = null;
      }
    }
    const onChange = () => {
      void refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === experienceChangedEvent) onChange();
    };
    onChange();
    const poll = window.setInterval(() => {
      if (!request) onChange();
    }, publicApiRefreshIntervalMs);
    window.addEventListener(experienceChangedEvent, onChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onChange);
    return () => {
      active = false;
      request?.abort();
      window.clearInterval(poll);
      window.removeEventListener(experienceChangedEvent, onChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl pb-12 pt-10 md:pt-16">
      <header className="relative overflow-hidden rounded-2xl border border-ink/10 bg-surface/70 p-7 md:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-ink/10" />
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-ink/50">
          Career journey
        </p>
        <h1 className="mt-3 text-5xl leading-none text-ink md:text-6xl">
          Experience
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-ink/70">
          The roles, teams, and work that have shaped my professional journey.
        </p>
      </header>
      {error && (
        <p
          role="status"
          className="mt-6 text-sm text-ink/60"
        >
          Experience could not be refreshed. Retrying automatically.
        </p>
      )}
      {loading && (
        <p className="mt-6 text-sm text-ink/60">Loading experience…</p>
      )}
      {!loading && !error && experience.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">No experience published yet.</p>
      )}
      <div className="mt-6 grid gap-5">
        {experience.map((item) => (
          <ExperienceCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </main>
  );
}
