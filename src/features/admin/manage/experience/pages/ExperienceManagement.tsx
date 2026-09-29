import {
  getAdminExperience,
  saveAdminExperience,
  updateExperienceVisibility,
  deleteAdminExperience,
  reorderExperience,
} from "../services/experience.service";
import { useEffect, useRef, useState, type FormEvent } from "react";
import ExperienceTable from "../components/ExperienceTable";
import { Modal } from "@/shared/components/ui";
import { AdminContentSkeleton } from "@/shared/components/Loading";
import type {
  Experience,
  ExperienceInput,
} from "@/features/public/experience/types/experience";
import { experiencePeriod } from "@/features/public/experience/utils/experiencePeriod";
import { notifyExperienceChanged } from "@/features/public/experience/services/experience.service";

const inputClass =
  "mt-2 w-full rounded-md border border-ink/20 bg-surface px-3 py-2 text-ink";

export default function ExperienceManagement() {
  const [items, setItems] = useState<Experience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [viewing, setViewing] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState<Experience | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(
    null,
  );
  const [visibilityExperience, setVisibilityExperience] =
    useState<Experience | null>(null);
  const [pendingSave, setPendingSave] = useState<ExperienceInput | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Experience[] | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const orderedItems = items
    .filter((experience) => !experience.deletedAt)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );

  function moveExperience(index: number, direction: number) {
    const next = [...orderedItems];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrderError(null);
    setPendingOrder(next);
  }

  async function saveOrder() {
    if (!pendingOrder || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setOrderError(null);
    try {
      const updated = await reorderExperience(
        pendingOrder.map((item) => item.id),
      );
      setItems(updated);
      notifyExperienceChanged();
      setPendingOrder(null);
    } catch (error) {
      setOrderError(
        error instanceof Error ? error.message : "Failed to save order.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    getAdminExperience(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setItems(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setLoadError("Failed to load experience.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  function closeForm() {
    if (!submittingRef.current) {
      setShowForm(false);
      setPendingSave(null);
    }
  }

  function prepareSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const company = value("company");
    const role = value("role");
    const description = value("description");
    if (!company || !role || !description) {
      setFormError("Enter a company, role, and description.");
      return;
    }
    if (
      !value("startDate") ||
      (value("endDate") && value("endDate") < value("startDate"))
    ) {
      setFormError("Enter a start date and an end date on or after it.");
      return;
    }
    setFormError(null);
    setPendingSave({
      company,
      role,
      description,
      location: value("location"),
      startDate: value("startDate"),
      endDate: value("endDate") || null,
      highlights: value("highlights")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      published: data.get("published") === "true",
    });
  }

  async function saveExperience() {
    if (!pendingSave || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const experience = await saveAdminExperience(pendingSave, editing?.id);
      setItems((current) =>
        editing
          ? current.map((item) =>
              item.id === experience.id ? experience : item,
            )
          : [...current, experience],
      );
      notifyExperienceChanged();
      setShowForm(false);
      setPendingSave(null);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save experience.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function toggleVisibility(experience: Experience) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setUpdatingVisibility(experience.id);
    setVisibilityError(null);
    try {
      const updated = await updateExperienceVisibility(
        experience.id,
        !experience.published,
      );
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      notifyExperienceChanged();
      setVisibilityExperience(null);
    } catch (error) {
      setVisibilityError(
        error instanceof Error
          ? error.message
          : "Failed to update experience visibility.",
      );
    } finally {
      submittingRef.current = false;
      setUpdatingVisibility(null);
    }
  }

  async function deleteExperience() {
    if (!deleting || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setDeleteError(null);
    try {
      await deleteAdminExperience(deleting.id);
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      notifyExperienceChanged();
      setDeleting(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete experience.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-outlet-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl text-ink">Experience</h1>
          <p className="mt-2 text-sm text-ink/60">
            Manage your portfolio experience.
          </p>
        </div>
        <button
          type="button"
          disabled={updatingVisibility !== null}
          className="rounded bg-ink px-4 py-2 text-paper disabled:opacity-50"
          onClick={() => {
            setEditing(null);
            setFormError(null);
            setShowForm(true);
          }}
        >
          New Experience
        </button>
      </div>
      {isLoading ? (
        <div className="mt-8">
          <AdminContentSkeleton
            label="experience"
            layout="responsive-table"
            rows={4}
            columns={6}
            tableMinWidth={880}
          />
        </div>
      ) : loadError ? (
        <div role="alert" className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
          <span>{loadError}</span>
          <button type="button" onClick={() => { setIsLoading(true); setLoadError(null); setReloadKey((key) => key + 1); }} className="rounded-lg border border-red-500/25 px-3 py-2 font-medium text-red-700 transition hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
            Try again
          </button>
        </div>
      ) : <ExperienceTable
        orderedItems={orderedItems}
        isSubmitting={isSubmitting}
        updatingVisibility={updatingVisibility}
        moveExperience={moveExperience}
        onView={setViewing}
        onEdit={(item) => {
          setEditing(item);
          setFormError(null);
          setShowForm(true);
        }}
        onVisibility={(item) => {
          setVisibilityError(null);
          setVisibilityExperience(item);
        }}
        onDelete={(item) => {
          setDeleteError(null);
          setDeleting(item);
        }}
      />}
      <Modal
        isOpen={pendingOrder !== null}
        onClose={() => {
          if (!submittingRef.current) setPendingOrder(null);
        }}
        title="Confirm Experience Order"
        size="sm"
      >
        <div
          className="space-y-5 text-ink"
          aria-busy={isSubmitting}
        >
          <p>
            Save this order? Public experience will appear in this sequence on
            your portfolio.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            {pendingOrder?.map((experience) => (
              <li key={experience.id}>
                {experience.company}
                {!experience.published && (
                  <span className="text-ink/50"> (Hidden)</span>
                )}
              </li>
            ))}
          </ol>
          {orderError && (
            <p
              role="alert"
              className="text-sm text-red-500"
            >
              {orderError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setPendingOrder(null)}
              className="rounded-md border border-ink/20 px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void saveOrder()}
              className="rounded-md bg-ink px-4 py-2 text-paper disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Confirm Order"}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editing ? "Edit Experience" : "New Experience"}
        size="lg"
      >
        {pendingSave && (
          <div
            className="space-y-5 text-ink"
            aria-busy={isSubmitting}
          >
            <p>
              {editing ? "Save changes to" : "Create"} “{pendingSave.company}”
              with {pendingSave.published ? "public" : "hidden"} visibility?
            </p>
            {formError && (
              <p
                role="alert"
                className="text-sm text-red-500"
              >
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setPendingSave(null);
                  setFormError(null);
                }}
                className="rounded-md border border-ink/20 px-4 py-2 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void saveExperience()}
                className="rounded-md bg-ink px-4 py-2 text-paper disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        )}
        <form
          hidden={pendingSave !== null}
          key={editing?.id ?? "new"}
          onSubmit={prepareSave}
          className="space-y-5"
          aria-busy={isSubmitting}
        >
          {formError && (
            <p
              role="alert"
              className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500"
            >
              {formError}
            </p>
          )}
          <fieldset
            disabled={isSubmitting}
            className="space-y-5 disabled:opacity-60"
          >
            <label className="block text-sm text-ink">
              Company
              <input
                name="company"
                defaultValue={editing?.company ?? ""}
                required
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink">
              Your role
              <input
                name="role"
                defaultValue={editing?.role ?? ""}
                required
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink">
              Description
              <textarea
                name="description"
                defaultValue={editing?.description ?? ""}
                required
                rows={4}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink">
              Location
              <input
                name="location"
                defaultValue={editing?.location ?? ""}
                className={inputClass}
                placeholder="City or Remote"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-ink">
                Start date
                <input
                  type="month"
                  name="startDate"
                  required
                  defaultValue={editing?.startDate ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-ink">
                End date
                <input
                  type="month"
                  name="endDate"
                  defaultValue={editing?.endDate ?? ""}
                  className={inputClass}
                />
                <span className="text-xs text-ink/60">
                  Leave blank for a current role.
                </span>
              </label>
            </div>
            <label className="block text-sm text-ink">
              Highlights
              <span className="block text-xs text-ink/60">
                Add one highlight per line.
              </span>
              <textarea
                name="highlights"
                defaultValue={editing?.highlights.join("\n") ?? ""}
                rows={3}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink">
              Visibility
              <select
                name="published"
                defaultValue={String(editing?.published ?? false)}
                className={inputClass}
              >
                <option value="true">Public — show on portfolio</option>
                <option value="false">Hidden — hide from portfolio</option>
              </select>
            </label>
          </fieldset>
          <div className="flex justify-end gap-3 border-t border-ink/10 pt-4">
            <button
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
              className="rounded-md border border-ink/20 px-4 py-2 text-sm text-ink disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Create Experience"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={visibilityExperience !== null}
        onClose={() => {
          if (!submittingRef.current) setVisibilityExperience(null);
        }}
        title={
          visibilityExperience?.published
            ? "Hide Experience"
            : "Publish Experience"
        }
        size="sm"
      >
        {visibilityExperience && (
          <div
            className="space-y-5 text-ink"
            aria-busy={updatingVisibility !== null}
          >
            <p>
              {visibilityExperience.published ? "Hide" : "Publish"} “
              {visibilityExperience.company}”?{" "}
              {visibilityExperience.published
                ? "It will stay in the admin table but disappear from your public portfolio."
                : "It will become visible on your public portfolio."}
            </p>
            {visibilityError && (
              <p
                role="alert"
                className="text-sm text-red-500"
              >
                {visibilityError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={updatingVisibility !== null}
                onClick={() => setVisibilityExperience(null)}
                className="rounded-md border border-ink/20 px-4 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingVisibility !== null}
                onClick={() => void toggleVisibility(visibilityExperience)}
                className="rounded-md bg-ink px-4 py-2 text-paper disabled:opacity-50"
              >
                {updatingVisibility
                  ? "Saving…"
                  : visibilityExperience.published
                    ? "Confirm Hide"
                    : "Confirm Publish"}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.company ?? "Experience"}
        size="lg"
      >
        {viewing && (
          <div className="space-y-5 text-ink">
            <p className="text-sm text-ink/60">
              {viewing.role} · {viewing.published ? "Public" : "Hidden"}
            </p>
            <p className="whitespace-pre-wrap">{viewing.description}</p>
            <p>
              {experiencePeriod(viewing)}
              {viewing.location ? ` · ${viewing.location}` : ""}
            </p>
            <div>
              <h3 className="font-semibold">Highlights</h3>
              {viewing.highlights.length ? (
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  {viewing.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2">No highlights added.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={deleting !== null}
        onClose={() => {
          if (!submittingRef.current) setDeleting(null);
        }}
        title="Delete Experience"
        size="sm"
      >
        <div
          className="space-y-5 text-ink"
          aria-busy={isSubmitting}
        >
          <p>
            Delete “{deleting?.company}”? It will be removed from your portfolio
            and this table.
          </p>
          {deleteError && (
            <p
              role="alert"
              className="text-sm text-red-500"
            >
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setDeleting(null)}
              className="rounded-md border border-ink/20 px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void deleteExperience()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {isSubmitting ? "Deleting…" : "Delete Experience"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
