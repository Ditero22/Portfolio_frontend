import { useEffect, useState } from "react";
import { BriefcaseBusiness, CircleCheck, CircleOff } from "lucide-react";
import { Modal } from "@/shared/components/ui";
import ResumeManager from "../components/ResumeManager";
import {
  getAdminHiringStatus,
  saveAdminHiringStatus,
} from "../services/settings.service";

export default function SettingsManagement() {
  const [isHired, setIsHired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getAdminHiringStatus(controller.signal)
      .then((settings) => {
        if (!controller.signal.aborted) setIsHired(settings.isHired);
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load settings.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function saveStatus() {
    if (pending === null || saving) return;
    setSaving(true);
    setError(null);
    try {
      const status = await saveAdminHiringStatus(pending);
      setIsHired(status.isHired);
      setPending(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update availability.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <header className="mb-8">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">
          Portfolio / Admin
        </p>
        <h1 className="text-4xl text-ink">Settings</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">
          Choose the hiring status shown beside your introduction on the landing
          page.
        </p>
      </header>

      <section className="rounded-2xl border border-ink/10 bg-surface p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <BriefcaseBusiness size={21} />
            </span>
            <div>
              <h2 className="text-xl text-ink">Hiring status</h2>
              <p className="mt-1 max-w-lg text-sm leading-6 text-ink/55">
                When you are hired, visitors will see “Currently hired.” Switch
                it off to show “Available for work.”
              </p>
            </div>
          </div>

          {loading ? (
            <span className="text-sm text-ink/50">Loading…</span>
          ) : (
            <button
              type="button"
              role="switch"
              aria-checked={isHired}
              disabled={saving}
              onClick={() => setPending(!isHired)}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition ${
                isHired ? "bg-amber-500" : "bg-teal-600"
              } disabled:opacity-50`}
            >
              <span
                className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  isHired ? "translate-x-6" : "translate-x-0"
                }`}
              />
              <span className="sr-only">Currently hired</span>
            </button>
          )}
        </div>

        {!loading && (
          <div className="mt-6 flex items-center gap-2 border-t border-ink/10 pt-5 text-sm">
            {isHired ? (
              <>
                <CircleOff
                  size={17}
                  className="text-amber-600"
                />
                <span className="text-ink">Currently hired</span>
              </>
            ) : (
              <>
                <CircleCheck
                  size={17}
                  className="text-teal-600"
                />
                <span className="text-ink">Available for work</span>
              </>
            )}
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </section>

      <ResumeManager />

      <Modal
        isOpen={pending !== null}
        onClose={() => !saving && setPending(null)}
        title="Confirm hiring status"
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p>
            Set your public status to “
            {pending ? "Currently hired" : "Available for work"}”?
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setPending(null)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveStatus()}
              className="rounded-lg bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              {saving ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
