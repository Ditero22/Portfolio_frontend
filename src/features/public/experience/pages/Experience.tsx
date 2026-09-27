import { useEffect, useState } from "react";

import {
  getExperience,
  experienceChangedEvent,
} from "../services/experience.service";
import type { Experience } from "../types/experience";
import ExperienceCard from "../components/ExperienceCard";
import { publicApiRefreshIntervalMs } from "@/shared/api";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

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
    <PublicPageFrame
      number="02"
      eyebrow="Career journey"
      title="Experience"
      description="The roles, teams, and work that have shaped my professional journey."
    >
      {error && (
        <p
          role="status"
          className="public-page-notice"
        >
          Experience could not be refreshed. Retrying automatically.
        </p>
      )}
      {loading && (
        <p className="public-content-empty">Loading experience…</p>
      )}
      {!loading && !error && experience.length === 0 && (
        <p className="public-content-empty">No experience published yet.</p>
      )}
      <div className="public-page-list">
        {experience.map((item) => (
          <ExperienceCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </PublicPageFrame>
  );
}
