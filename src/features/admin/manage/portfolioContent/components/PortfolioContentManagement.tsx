import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Modal } from "@/shared/components/ui";
import type {
  PortfolioContent,
  PortfolioContentInput,
  PortfolioContentKind,
} from "@/features/public/portfolioContent/types/portfolioContent";
import {
  deleteAdminContent,
  getAdminContent,
  reorderAdminContent,
  saveAdminContent,
  updateContentVisibility,
} from "../services/portfolioContent.service";

export interface PortfolioContentAdminConfig {
  kind: PortfolioContentKind;
  title: string;
  singular: string;
  description: string;
  titleLabel: string;
  subtitleLabel: string;
  descriptionLabel: string;
  categoryLabel: string;
  sampleData?: PortfolioContentInput[];
}

const inputClass =
  "mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal-500";
const categorySelectClass =
  `${inputClass} focus:border-ink/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`;

export default function PortfolioContentManagement({
  config,
}: {
  config: PortfolioContentAdminConfig;
}) {
  const [items, setItems] = useState<PortfolioContent[]>([]);
  const [pendingOrder, setPendingOrder] = useState<PortfolioContent[] | null>(
    null,
  );
  const [editing, setEditing] = useState<PortfolioContent | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState<PortfolioContentInput | null>(
    null,
  );
  const [visibilityTarget, setVisibilityTarget] =
    useState<PortfolioContent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioContent | null>(
    null,
  );
  const [confirmOrder, setConfirmOrder] = useState(false);
  const [confirmSamples, setConfirmSamples] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importingSamples, setImportingSamples] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setItems(await getAdminContent(config.kind));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : `Could not load ${config.title.toLowerCase()}.`,
      );
    } finally {
      setLoading(false);
    }
  }, [config.kind, config.title]);

  useEffect(() => {
    void Promise.resolve().then(() => refresh());
  }, [refresh]);

  const shownItems = pendingOrder ?? items;
  const existingTitles = new Set(
    items.map((item) => item.title.trim().toLocaleLowerCase()),
  );
  const missingSampleCount = (config.sampleData ?? []).filter(
    (sample) => !existingTitles.has(sample.title.trim().toLocaleLowerCase()),
  ).length;

  function moveItem(index: number, direction: -1 | 1) {
    const next = [...shownItems];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPendingOrder(next);
  }

  function prepareSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (field: string) => String(form.get(field) ?? "").trim();
    const title = get("title");
    if (!title) {
      setError(`${config.titleLabel} is required.`);
      return;
    }
    const url = get("url");
    if (url && !/^https?:\/\//i.test(url)) {
      setError("Links must start with https:// or http://.");
      return;
    }
    setError(null);
    setPendingSave({
      title,
      subtitle: get("subtitle") || null,
      description: get("description") || null,
      category: get("category") || null,
      url: url || null,
      published: get("published") === "true",
    });
  }

  async function save() {
    if (!pendingSave || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await saveAdminContent(
        config.kind,
        pendingSave,
        editing?.id,
      );
      setItems((current) =>
        editing
          ? current.map((item) => (item.id === result.id ? result : item))
          : [...current, result],
      );
      setPendingSave(null);
      setEditorOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save item.",
      );
      setPendingSave(null);
    } finally {
      setBusy(false);
    }
  }

  async function changeVisibility() {
    if (!visibilityTarget || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await updateContentVisibility(
        config.kind,
        visibilityTarget,
        !visibilityTarget.published,
      );
      setItems((current) =>
        current.map((item) => (item.id === result.id ? result : item)),
      );
      setVisibilityTarget(null);
    } catch (visibilityError) {
      setError(
        visibilityError instanceof Error
          ? visibilityError.message
          : "Could not update visibility.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeItem() {
    if (!deleteTarget || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAdminContent(config.kind, deleteTarget.id);
      setItems((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete item.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveOrder() {
    if (!pendingOrder || busy) return;
    setBusy(true);
    setError(null);
    try {
      setItems(
        await reorderAdminContent(
          config.kind,
          pendingOrder.map((item) => item.id),
        ),
      );
      setPendingOrder(null);
      setConfirmOrder(false);
    } catch (orderError) {
      setError(
        orderError instanceof Error
          ? orderError.message
          : "Could not reorder items.",
      );
      setConfirmOrder(false);
    } finally {
      setBusy(false);
    }
  }

  async function loadSampleData() {
    if (!config.sampleData?.length || importingSamples) return;
    setImportingSamples(true);
    setError(null);
    try {
      const titles = new Set(
        items.map((item) => item.title.trim().toLocaleLowerCase()),
      );
      for (const sample of config.sampleData) {
        const normalizedTitle = sample.title.trim().toLocaleLowerCase();
        if (titles.has(normalizedTitle)) continue;
        await saveAdminContent(config.kind, sample);
        titles.add(normalizedTitle);
      }
      setItems(await getAdminContent(config.kind));
      setConfirmSamples(false);
    } catch (sampleError) {
      setError(
        sampleError instanceof Error
          ? sampleError.message
          : "Could not load sample data.",
      );
      await refresh();
    } finally {
      setImportingSamples(false);
    }
  }

  function openNew() {
    setEditing(null);
    setError(null);
    setEditorOpen(true);
  }

  function openEdit(item: PortfolioContent) {
    setEditing(item);
    setError(null);
    setEditorOpen(true);
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">
            Portfolio content / Admin
          </p>
          <h1 className="text-4xl text-ink">{config.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">
            {config.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {config.sampleData?.length ? (
            <button
              type="button"
              onClick={() => setConfirmSamples(true)}
              disabled={loading || missingSampleCount === 0}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Load sample data
              {missingSampleCount > 0 && (
                <span className="font-mono text-[10px] text-ink/50">
                  {missingSampleCount}
                </span>
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition hover:bg-ink/80"
          >
            <Plus size={16} /> Add {config.singular}
          </button>
        </div>
      </header>

      {error && !editorOpen && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      {pendingOrder && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
          <p className="text-sm text-ink">
            The display order has unsaved changes.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendingOrder(null)}
              className="rounded-lg border border-ink/15 px-3 py-2 text-xs text-ink"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => setConfirmOrder(true)}
              className="rounded-lg bg-ink px-3 py-2 text-xs text-paper"
            >
              Save order
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-ink/10 bg-surface p-8 text-sm text-ink/55">
          Loading {config.title.toLowerCase()}…
        </div>
      ) : shownItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-surface p-9 text-center">
          <p className="text-lg text-ink">Nothing here yet</p>
          <p className="mt-2 text-sm text-ink/55">
            Add your first {config.singular.toLowerCase()} to start building
            this section.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shownItems.map((item, index) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink/10 bg-surface p-4 md:p-5"
            >
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  className="rounded-md p-2 text-ink/55 hover:bg-ink/5 disabled:opacity-25"
                  aria-label={`Move ${item.title} up`}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  disabled={index === shownItems.length - 1}
                  onClick={() => moveItem(index, 1)}
                  className="rounded-md p-2 text-ink/55 hover:bg-ink/5 disabled:opacity-25"
                  aria-label={`Move ${item.title} down`}
                >
                  <ArrowDown size={15} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-medium text-ink">
                    {item.title}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider ${
                      item.published
                        ? "bg-teal-500/10 text-teal-700"
                        : "bg-ink/5 text-ink/45"
                    }`}
                  >
                    {item.published ? "Public" : "Hidden"}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-ink/55">
                  {[item.subtitle, item.category].filter(Boolean).join(" · ") ||
                    item.description ||
                    "No extra details"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setVisibilityTarget(item)}
                  className="rounded-lg p-2.5 text-ink/60 transition hover:bg-ink/5 hover:text-ink"
                  aria-label={`${item.published ? "Hide" : "Publish"} ${item.title}`}
                  title={item.published ? "Hide from public" : "Publish"}
                >
                  {item.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-lg p-2.5 text-ink/60 transition hover:bg-ink/5 hover:text-ink"
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="rounded-lg p-2.5 text-red-500/70 transition hover:bg-red-500/10 hover:text-red-600"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={confirmSamples}
        onClose={() => !importingSamples && setConfirmSamples(false)}
        title="Load sample data"
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p>
            Add {missingSampleCount} missing {config.title.toLowerCase()} sample
            entries? Published examples will show publicly. Existing entries
            with matching titles will be skipped.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={importingSamples}
              onClick={() => setConfirmSamples(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={importingSamples || missingSampleCount === 0}
              onClick={() => void loadSampleData()}
              className="rounded-lg bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              {importingSamples ? "Loading…" : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={editorOpen}
        onClose={() => {
          if (!busy) {
            setEditorOpen(false);
            setPendingSave(null);
          }
        }}
        title={`${editing ? "Edit" : "Add"} ${config.singular}`}
        size="lg"
      >
        <form
          key={editing?.id ?? "new"}
          onSubmit={prepareSave}
          className="space-y-4 text-ink"
        >
          <label className="block text-sm">
            {config.titleLabel}
            <input
              className={inputClass}
              name="title"
              defaultValue={editing?.title ?? ""}
              maxLength={160}
              required
            />
          </label>
          <label className="block text-sm">
            {config.subtitleLabel}
            <input
              className={inputClass}
              name="subtitle"
              defaultValue={editing?.subtitle ?? ""}
              maxLength={160}
            />
          </label>
          <label className="block text-sm">
            {config.categoryLabel}
            {config.kind === "skills" ? (
              <select
                className={categorySelectClass}
                name="category"
                defaultValue={editing?.category ?? "Frontend"}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Networking</option>
                <option>Other</option>
              </select>
            ) : (
              <input
                className={inputClass}
                name="category"
                defaultValue={editing?.category ?? ""}
                maxLength={80}
              />
            )}
          </label>
          <label className="block text-sm">
            {config.descriptionLabel}
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              name="description"
              defaultValue={editing?.description ?? ""}
              maxLength={4000}
              rows={4}
            />
          </label>
          <label className="block text-sm">
            Link (optional)
            <input
              className={inputClass}
              name="url"
              defaultValue={editing?.url ?? ""}
              placeholder="https://"
              type="url"
            />
          </label>
          <label className="block text-sm">
            Visibility
            <select
              className={inputClass}
              name="published"
              defaultValue={editing?.published ? "true" : "false"}
            >
              <option value="true">Published</option>
              <option value="false">Hidden</option>
            </select>
          </label>
          {error && (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-ink/10 pt-4">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-ink px-4 py-2 text-sm text-paper"
            >
              Continue
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={pendingSave !== null}
        onClose={() => {
          if (!busy) setPendingSave(null);
        }}
        title="Confirm changes"
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p>
            {editing ? "Save changes to" : "Add"} “{pendingSave?.title}”?
            {pendingSave?.published
              ? " It will be visible on your public portfolio."
              : " It will be saved as hidden content."}
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setPendingSave(null)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-lg bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              {busy ? "Saving…" : "Confirm save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={visibilityTarget !== null}
        onClose={() => !busy && setVisibilityTarget(null)}
        title={visibilityTarget?.published ? "Hide item" : "Publish item"}
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p>
            {visibilityTarget?.published ? "Hide" : "Publish"} “
            {visibilityTarget?.title}” on the public portfolio?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setVisibilityTarget(null)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void changeVisibility()}
              className="rounded-lg bg-ink px-4 py-2 text-sm text-paper"
            >
              {busy ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => !busy && setDeleteTarget(null)}
        title={`Delete ${config.singular}`}
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p>
            Delete “{deleteTarget?.title}”? This removes it from the admin list
            and public portfolio.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void removeItem()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
            >
              {busy ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmOrder}
        onClose={() => !busy && setConfirmOrder(false)}
        title="Save display order"
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p>
            Apply this new order to the public {config.title.toLowerCase()}{" "}
            page?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmOrder(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveOrder()}
              className="rounded-lg bg-ink px-4 py-2 text-sm text-paper"
            >
              {busy ? "Saving…" : "Confirm order"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
