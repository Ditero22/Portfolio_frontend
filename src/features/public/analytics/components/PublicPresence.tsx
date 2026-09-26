import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useLocation } from "react-router-dom";
import { API_URL } from "@/shared/api";

const visitorStorageKey = "portfolio-visitor-id";

function getVisitorId() {
  try {
    const saved = localStorage.getItem(visitorStorageKey);
    if (saved) return saved;
  } catch {
    // Use an in-memory id for this page if browser storage is unavailable.
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  try {
    localStorage.setItem(visitorStorageKey, id);
  } catch {
    // The generated id still supports the live count for this page session.
  }
  return id;
}

export default function PublicPresence() {
  const location = useLocation();
  const [visitorId] = useState(getVisitorId);
  const [viewers, setViewers] = useState<number | null>(null);

  useEffect(() => {
    void fetch(`${API_URL}/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, path: location.pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [location.pathname, visitorId]);

  useEffect(() => {
    const stream = new EventSource(
      `${API_URL}/analytics/presence?visitorId=${encodeURIComponent(visitorId)}`,
    );
    stream.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { viewers?: unknown };
        if (typeof data.viewers === "number") setViewers(data.viewers);
      } catch {
        // Ignore malformed events and wait for the next server update.
      }
    };
    return () => stream.close();
  }, [visitorId]);

  return (
    <div
      className="public-live-viewers"
      role="status"
      aria-live="polite"
      aria-label={`${viewers ?? 0} viewers currently online`}
      title="People viewing this portfolio right now"
    >
      <span className="public-live-viewers-icon">
        <Eye size={15} />
      </span>
      <span>{viewers ?? "—"}</span>
      <span className="public-live-viewers-label">viewing now</span>
      <span className="public-live-viewers-live">LIVE</span>
    </div>
  );
}
