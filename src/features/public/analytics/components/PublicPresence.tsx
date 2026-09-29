import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useLocation } from "react-router-dom";
import { API_URL, apiFetch } from "@/shared/api";

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
    void apiFetch(`${API_URL}/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, path: location.pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [location.pathname, visitorId]);

  useEffect(() => {
    let active = true;
    let stream: EventSource | null = null;
    let reconnectTimer: number | null = null;
    let reconnectDelayMs = 15_000;

    function clearReconnectTimer() {
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }

    function closeStream() {
      stream?.close();
      stream = null;
    }

    function connect() {
      if (
        !active ||
        stream ||
        document.visibilityState === "hidden" ||
        !navigator.onLine
      )
        return;

      const connection = new EventSource(
        `${API_URL}/analytics/presence?visitorId=${encodeURIComponent(visitorId)}`,
      );
      stream = connection;

      connection.onmessage = (event) => {
        if (!active) return;

        try {
          const data = JSON.parse(event.data) as { viewers?: unknown };
          if (typeof data.viewers === "number") {
            reconnectDelayMs = 15_000;
            setViewers(data.viewers);
          }
        } catch {
          // Ignore malformed events and wait for the next server update.
        }
      };

      connection.onerror = () => {
        connection.close();
        if (stream === connection) stream = null;
        if (!active) return;

        setViewers(null);

        if (
          document.visibilityState === "hidden" ||
          !navigator.onLine
        )
          return;

        clearReconnectTimer();
        const delay = reconnectDelayMs;
        reconnectDelayMs = Math.min(reconnectDelayMs * 2, 60_000);
        reconnectTimer = window.setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, delay);
      };
    }

    function reconnectNow() {
      clearReconnectTimer();
      closeStream();
      connect();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        reconnectNow();
      } else {
        clearReconnectTimer();
        closeStream();
        setViewers(null);
      }
    }

    connect();
    window.addEventListener("online", reconnectNow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      clearReconnectTimer();
      closeStream();
      window.removeEventListener("online", reconnectNow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [visitorId]);

  return (
    <div
      className="public-live-viewers"
      role="status"
      aria-live="polite"
      aria-label={
        viewers === null
          ? "Live viewer count unavailable"
          : `${viewers} viewers currently online`
      }
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
