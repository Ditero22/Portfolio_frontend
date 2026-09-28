import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, FileText, History, Upload } from "lucide-react";
import { Modal } from "@/shared/components/ui";
import {
  activateAdminResume,
  downloadAdminResumeVersion,
  getAdminResumeVersions,
  uploadAdminResume,
} from "../services/settings.service";
import type { ResumeVersion } from "@/features/public/resume/types/resume";

const maxResumeBytes = 15 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(0)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function formatUploadDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResumeManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingActivationId, setPendingActivationId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const items = await getAdminResumeVersions(signal);
      if (!signal?.aborted) {
        setVersions(items);
        setError(null);
      }
    } catch (loadError) {
      if (!signal?.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load saved resume versions.",
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refresh(controller.signal));
    return () => controller.abort();
  }, [refresh]);

  function selectFile(file: File | undefined) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "docx") {
      setError("Choose a PDF or DOCX file.");
      return;
    }
    if (file.size > maxResumeBytes) {
      setError("Resume files must be 15 MB or smaller.");
      return;
    }
    setError(null);
    setPendingFile(file);
  }

  async function confirmChange() {
    if (saving || (!pendingFile && !pendingActivationId)) return;
    setSaving(true);
    setError(null);
    try {
      if (pendingFile) {
        const uploaded = await uploadAdminResume(pendingFile);
        setVersions((current) => [
          uploaded,
          ...current.map((version) => ({ ...version, isActive: false })),
        ]);
        setPendingFile(null);
        if (inputRef.current) inputRef.current.value = "";
      } else if (pendingActivationId) {
        const activeVersion = await activateAdminResume(pendingActivationId);
        setVersions((current) =>
          current.map((version) => ({
            ...version,
            isActive: version.id === activeVersion.id,
          })),
        );
        setPendingActivationId(null);
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update the public resume.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function downloadVersion(version: ResumeVersion) {
    setError(null);
    try {
      const blob = await downloadAdminResumeVersion(version.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = version.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Could not download that resume version.",
      );
    }
  }

  const pendingVersion = versions.find(
    (version) => version.id === pendingActivationId,
  );
  const isConfirmationOpen =
    pendingFile !== null || pendingActivationId !== null;

  return (
    <section className="mt-6 rounded-2xl border border-ink/10 bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
            <FileText
              size={21}
              aria-hidden="true"
            />
          </span>
          <div>
            <h2 className="text-xl text-ink">Public resume</h2>
            <p className="mt-1 max-w-lg text-sm leading-6 text-ink/55">
              Upload a PDF or DOCX. New uploads become public automatically;
              previous versions stay here so you can switch back.
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-label="Choose a PDF or DOCX resume file"
          className="sr-only"
          onChange={(event) => {
            selectFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={saving}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper transition hover:bg-ink/85 disabled:opacity-50"
        >
          <Upload
            size={15}
            aria-hidden="true"
          />
          Upload new resume
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div className="mt-6 border-t border-ink/10 pt-5">
        <div className="mb-3 flex items-center gap-2 text-ink">
          <History
            size={16}
            className="text-ink/45"
            aria-hidden="true"
          />
          <h3 className="text-sm font-medium">Saved versions</h3>
        </div>

        {loading ? (
          <p className="text-sm text-ink/50">Loading saved versions…</p>
        ) : versions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink/50">
            No resume uploaded yet. Your first upload will appear here and on
            the public landing page.
          </p>
        ) : (
          <ul className="space-y-2">
            {versions.map((version) => (
              <li
                key={version.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {version.fileName}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    {formatUploadDate(version.uploadedAt)} ·{" "}
                    {formatBytes(version.sizeBytes)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {version.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-1.5 text-xs text-teal-700">
                      <Check
                        size={13}
                        aria-hidden="true"
                      />
                      Public now
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setPendingActivationId(version.id)}
                      className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink transition hover:bg-ink/5 disabled:opacity-50"
                    >
                      Make public
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void downloadVersion(version)}
                    aria-label={`Download saved version ${version.fileName}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/65 transition hover:bg-ink/5 disabled:opacity-50"
                  >
                    <Download
                      size={14}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={isConfirmationOpen}
        onClose={() => {
          if (!saving) {
            setPendingFile(null);
            setPendingActivationId(null);
            setError(null);
          }
        }}
        title={pendingFile ? "Publish new resume" : "Switch public resume"}
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p className="text-sm leading-6">
            {pendingFile
              ? `Upload ${pendingFile.name} and make it the public download? Your previous versions will be kept.`
              : `Make ${pendingVersion?.fileName ?? "this version"} the current public download?`}
          </p>
          {error && (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setPendingFile(null);
                setPendingActivationId(null);
                setError(null);
              }}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void confirmChange()}
              className="rounded-lg bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : pendingFile
                  ? "Upload and publish"
                  : "Switch version"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
