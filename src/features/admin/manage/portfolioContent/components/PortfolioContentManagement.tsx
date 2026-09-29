import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminStatusBadge, Modal } from "@/shared/components/ui";
import { AdminContentSkeleton } from "@/shared/components/Loading";
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
  uploadPortfolioContentImage,
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
  urlLabel?: string;
  urlRequired?: boolean;
  imageUpload?: boolean;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    },
    [imagePreviewUrl],
  );

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
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
    if (config.urlRequired && !url) {
      setError(`${config.urlLabel ?? "Link"} is required.`);
      return;
    }
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
      imageUrl: config.imageUpload ? get("imageUrl") || null : null,
      published: get("published") === "true",
    });
  }

  async function save() {
    if (!pendingSave || busy) return;
    setBusy(true);
    setError(null);
    try {
      let saveData = pendingSave;
      if (config.imageUpload && imageFile) {
        const uploadedImageUrl = await uploadPortfolioContentImage(
          config.kind,
          imageFile,
        );
        saveData = { ...pendingSave, imageUrl: uploadedImageUrl };
        setPendingSave(saveData);
        setImageFile(null);
        setImageUrl(uploadedImageUrl);
        setImagePreviewUrl(uploadedImageUrl);
      }
      const result = await saveAdminContent(
        config.kind,
        saveData,
        editing?.id,
      );
      setItems((current) =>
        editing
          ? current.map((item) => (item.id === result.id ? result : item))
          : [...current, result],
      );
      setPendingSave(null);
      setEditorOpen(false);
      setImageFile(null);
      setImageUrl(null);
      setImagePreviewUrl(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save item.",
      );
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
    setImageFile(null);
    setImageUrl(null);
    setImagePreviewUrl(null);
    setEditorOpen(true);
  }

  function openEdit(item: PortfolioContent) {
    setEditing(item);
    setError(null);
    setImageFile(null);
    setImageUrl(item.imageUrl);
    setImagePreviewUrl(item.imageUrl);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (busy) return;
    setEditorOpen(false);
    setPendingSave(null);
    setImageFile(null);
    setImageUrl(null);
    setImagePreviewUrl(null);
  }

  return (
    <div className="admin-outlet-page">
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
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600"
        >
          {error}
          <button type="button" onClick={() => void refresh()} className="rounded-lg border border-red-500/25 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
            Try again
          </button>
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
        <AdminContentSkeleton label={config.title.toLowerCase()} layout="list" rows={4} />
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
                  onClick={() => moveItem(index, -1)}
                  className="rounded-md p-2 text-ink/55 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-teal-500 disabled:opacity-25"
                  aria-label={`Move ${item.title} up`}
                  title="Move up"
                  disabled={index === 0 || busy}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  className="rounded-md p-2 text-ink/55 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-teal-500 disabled:opacity-25"
                  aria-label={`Move ${item.title} down`}
                  title="Move down"
                  disabled={index === shownItems.length - 1 || busy}
                >
                  <ArrowDown size={15} />
                </button>
              </div>
              {config.imageUpload && item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-12 w-16 shrink-0 rounded-lg border border-ink/10 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-medium text-ink">
                    {item.title}
                  </h2>
                  <AdminStatusBadge variant={item.published ? "public" : "quiet"}>
                    {item.published ? "Public" : "Hidden"}
                  </AdminStatusBadge>
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
                  disabled={busy}
                >
                  {item.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-lg p-2.5 text-ink/60 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500 disabled:opacity-50"
                  aria-label={`Edit ${item.title}`}
                  title="Edit"
                  disabled={busy}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="rounded-lg p-2.5 text-red-500/70 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-50"
                  aria-label={`Delete ${item.title}`}
                  title="Delete"
                  disabled={busy}
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
        onClose={closeEditor}
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
            {config.urlLabel ?? "Link (optional)"}
            <input
              className={inputClass}
              name="url"
              defaultValue={editing?.url ?? ""}
              placeholder="https://"
              type="url"
              required={config.urlRequired}
            />
          </label>
          {config.imageUpload && (
            <div className="space-y-3 rounded-xl border border-ink/10 bg-ink/[0.025] p-4">
              <label className="block text-sm font-medium">
                Certification image (optional)
                <span className="mt-1 flex items-center gap-1.5 text-xs font-normal text-ink/50">
                  <ImagePlus size={14} aria-hidden="true" />
                  Upload a certificate image or screenshot, up to 5 MB.
                </span>
                <input
                  className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-xs file:font-medium file:text-ink`}
                  type="file"
                  name="certificationImage"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (!file) return;
                    const allowedTypes = [
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                      "image/gif",
                    ];
              if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
                      setError(
                        "Choose a JPG, PNG, WebP, or GIF image under 5 MB.",
                      );
                      event.currentTarget.value = "";
                      return;
                    }
                    setError(null);
                    setImageFile(file);
                    setImageUrl(null);
                    setImagePreviewUrl(URL.createObjectURL(file));
                  }}
                />
              </label>
              <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />
              {(imagePreviewUrl || imageUrl) && (
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={imagePreviewUrl ?? imageUrl ?? ""}
                    alt="Certification preview"
                    className="h-20 w-32 rounded-lg border border-ink/10 bg-paper object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImageUrl(null);
                      setImagePreviewUrl(null);
                    }}
                    className="rounded-lg border border-ink/15 px-3 py-2 text-xs text-ink/70 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-teal-500"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          )}
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
              onClick={closeEditor}
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
          {config.imageUpload && imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt="Certification image preview"
              className="max-h-48 w-full rounded-xl border border-ink/10 object-contain"
            />
          )}
          {error && (
            <p role="alert" className="rounded-lg bg-red-500/5 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
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
              {busy
                ? imageFile
                  ? "Uploading image…"
                  : "Saving…"
                : "Confirm save"}
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
