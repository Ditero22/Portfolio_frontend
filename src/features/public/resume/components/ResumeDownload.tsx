import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { API_URL } from "@/shared/api";
import {
  getPublicResume,
  resumeChangedEvent,
} from "../services/resume.service";
import type { PublicResume } from "../types/resume";

export default function ResumeDownload() {
  const [resume, setResume] = useState<PublicResume | null>(null);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    const refresh = () => {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;
      void getPublicResume(requestController.signal)
        .then((currentResume) => {
          if (active && !requestController.signal.aborted) {
            setResume(currentResume);
          }
        })
        .catch(() => {
          if (active && !requestController.signal.aborted) setResume(null);
        });
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === resumeChangedEvent) refresh();
    };

    refresh();
    window.addEventListener(resumeChangedEvent, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      controller?.abort();
      window.removeEventListener(resumeChangedEvent, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!resume) return null;

  return (
    <a
      href={`${API_URL}/resume/download`}
      className="landing-secondary-action"
      aria-label={`Download current resume: ${resume.fileName}`}
    >
      Download résumé{" "}
      <Download
        size={15}
        aria-hidden="true"
      />
    </a>
  );
}
