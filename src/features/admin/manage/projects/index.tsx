import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";
import { API_URL } from "@/shared/api";
import { Modal } from "@/shared/components/ui";
import { getAccessToken } from "@/features/auth/services/authStorage";
import type { Project } from "@/features/public/projects/types/project";
import { notifyProjectsChanged } from "@/features/public/projects/services/projects.service";

const inputClass =
  "mt-2 w-full rounded-md border border-ink/20 bg-surface px-3 py-2 text-ink";
const actionClass =
  "flex h-9 w-9 items-center justify-center rounded-md text-ink/70 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-ink";
type ProjectInput = Pick<
  Project,
  "title" | "role" | "description" | "stack" | "highlights" | "published"
>;

export default function ProjectManagement() {
  const [items, setItems] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [viewing, setViewing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(
    null,
  );
  const [visibilityProject, setVisibilityProject] = useState<Project | null>(
    null,
  );
  const [pendingSave, setPendingSave] = useState<ProjectInput | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Project[] | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const orderedItems = items
    .filter((project) => !project.deletedAt)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );

  function moveProject(index: number, direction: number) {
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
      const response = await fetch(`${API_URL}/admin/projects/order`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: pendingOrder.map((project) => project.id),
        }),
      });
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? "Projects changed. Refresh the page before reordering."
            : "Failed to save order. Please try again.",
        );
      const updated: Project[] = await response.json();
      setItems(updated);
      notifyProjectsChanged();
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
    fetch(`${API_URL}/admin/projects`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load projects.");
        return response.json() as Promise<Project[]>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setItems(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setLoadError("Failed to load projects.");
      });
    return () => controller.abort();
  }, []);

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
    const title = value("title");
    const role = value("role");
    const description = value("description");
    if (!title || !role || !description) {
      setFormError("Enter a title, role, and description.");
      return;
    }
    setFormError(null);
    setPendingSave({
      title,
      role,
      description,
      stack: value("stack")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      highlights: value("highlights")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      published: data.get("published") === "true",
    });
  }

  async function saveProject() {
    if (!pendingSave || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(
        `${API_URL}/projects${editing ? `/${encodeURIComponent(editing.id)}` : ""}`,
        {
          method: editing ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pendingSave),
        },
      );
      if (!response.ok)
        throw new Error("Failed to save project. Please try again.");
      const project: Project = await response.json();
      setItems((current) =>
        editing
          ? current.map((item) => (item.id === project.id ? project : item))
          : [...current, project],
      );
      notifyProjectsChanged();
      setShowForm(false);
      setPendingSave(null);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save project.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function toggleVisibility(project: Project) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setUpdatingVisibility(project.id);
    setVisibilityError(null);
    try {
      const response = await fetch(
        `${API_URL}/projects/${encodeURIComponent(project.id)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ published: !project.published }),
        },
      );
      if (!response.ok)
        throw new Error(
          "Failed to update project visibility. Please try again.",
        );
      const updated: Project = await response.json();
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      notifyProjectsChanged();
      setVisibilityProject(null);
    } catch (error) {
      setVisibilityError(
        error instanceof Error
          ? error.message
          : "Failed to update project visibility.",
      );
    } finally {
      submittingRef.current = false;
      setUpdatingVisibility(null);
    }
  }

  async function deleteProject() {
    if (!deleting || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setDeleteError(null);
    try {
      const response = await fetch(
        `${API_URL}/projects/${encodeURIComponent(deleting.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        },
      );
      if (!response.ok)
        throw new Error("Failed to delete project. Please try again.");
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      notifyProjectsChanged();
      setDeleting(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete project.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl text-ink">Projects</h1>
          <p className="mt-2 text-sm text-ink/60">
            Manage your portfolio projects.
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
          New Project
        </button>
      </div>
      {loadError && (
        <p
          role="alert"
          className="mt-6 text-sm text-red-500"
        >
          {loadError}
        </p>
      )}
      <div className="mt-8 overflow-x-auto rounded-xl border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5">
            <tr>
              <th className="p-4 text-center">Order</th>
              <th className="p-4 text-left">Project</th>
              <th className="text-left">Role</th>
              <th className="text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orderedItems.map((project, index) => (
              <tr
                key={project.id}
                className="border-t border-ink/10"
              >
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <span className="min-w-6 text-center tabular-nums">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={
                        index === 0 ||
                        isSubmitting ||
                        updatingVisibility !== null
                      }
                      title="Move up"
                      aria-label={`Move ${project.title} up`}
                      className={`${actionClass} disabled:opacity-30`}
                      onClick={() => moveProject(index, -1)}
                    >
                      <ArrowUp
                        size={16}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      disabled={
                        index === orderedItems.length - 1 ||
                        isSubmitting ||
                        updatingVisibility !== null
                      }
                      title="Move down"
                      aria-label={`Move ${project.title} down`}
                      className={`${actionClass} disabled:opacity-30`}
                      onClick={() => moveProject(index, 1)}
                    >
                      <ArrowDown
                        size={16}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </td>
                <td className="p-4">{project.title}</td>
                <td>{project.role}</td>
                <td>{project.published ? "Public" : "Hidden"}</td>
                <td className="p-4 align-middle">
                  <fieldset
                    disabled={updatingVisibility !== null}
                    className="flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <button
                      type="button"
                      className={actionClass}
                      title="View"
                      aria-label={`View ${project.title}`}
                      onClick={() => setViewing(project)}
                    >
                      <Eye
                        size={18}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      className={actionClass}
                      title="Edit"
                      aria-label={`Edit ${project.title}`}
                      onClick={() => {
                        setEditing(project);
                        setFormError(null);
                        setShowForm(true);
                      }}
                    >
                      <Pencil
                        size={18}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={project.published}
                      aria-label={`Public visibility for ${project.title}`}
                      title={
                        project.published
                          ? "Public — click to hide"
                          : "Hidden — click to publish"
                      }
                      className="flex h-9 w-12 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-ink"
                      onClick={() => {
                        setVisibilityError(null);
                        setVisibilityProject(project);
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${project.published ? "bg-ink" : "bg-ink/25"}`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full bg-paper shadow-sm transition-transform ${project.published ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`${actionClass} hover:text-red-500`}
                      title="Delete"
                      aria-label={`Delete ${project.title}`}
                      onClick={() => {
                        setDeleteError(null);
                        setDeleting(project);
                      }}
                    >
                      <Trash2
                        size={18}
                        aria-hidden="true"
                      />
                    </button>
                  </fieldset>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={pendingOrder !== null}
        onClose={() => {
          if (!submittingRef.current) setPendingOrder(null);
        }}
        title="Confirm Project Order"
        size="sm"
      >
        <div
          className="space-y-5 text-ink"
          aria-busy={isSubmitting}
        >
          <p>
            Save this order? Public projects will appear in this sequence on
            your portfolio.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            {pendingOrder?.map((project) => (
              <li key={project.id}>
                {project.title}
                {!project.published && (
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
        title={editing ? "Edit Project" : "New Project"}
        size="lg"
      >
        {pendingSave && (
          <div
            className="space-y-5 text-ink"
            aria-busy={isSubmitting}
          >
            <p>
              {editing ? "Save changes to" : "Create"} “{pendingSave.title}”
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
                onClick={() => void saveProject()}
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
              Project title
              <input
                name="title"
                defaultValue={editing?.title ?? ""}
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
              Tech stack
              <span className="block text-xs text-ink/60">
                Separate technologies with commas.
              </span>
              <input
                name="stack"
                defaultValue={editing?.stack.join(", ") ?? ""}
                placeholder="React, TypeScript, PostgreSQL"
                className={inputClass}
              />
            </label>
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
                defaultValue={String(editing?.published ?? true)}
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
                  : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={visibilityProject !== null}
        onClose={() => {
          if (!submittingRef.current) setVisibilityProject(null);
        }}
        title={
          visibilityProject?.published ? "Hide Project" : "Publish Project"
        }
        size="sm"
      >
        {visibilityProject && (
          <div
            className="space-y-5 text-ink"
            aria-busy={updatingVisibility !== null}
          >
            <p>
              {visibilityProject.published ? "Hide" : "Publish"} “
              {visibilityProject.title}”?{" "}
              {visibilityProject.published
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
                onClick={() => setVisibilityProject(null)}
                className="rounded-md border border-ink/20 px-4 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingVisibility !== null}
                onClick={() => void toggleVisibility(visibilityProject)}
                className="rounded-md bg-ink px-4 py-2 text-paper disabled:opacity-50"
              >
                {updatingVisibility
                  ? "Saving…"
                  : visibilityProject.published
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
        title={viewing?.title ?? "Project"}
        size="lg"
      >
        {viewing && (
          <div className="space-y-5 text-ink">
            <p className="text-sm text-ink/60">
              {viewing.role} · {viewing.published ? "Public" : "Hidden"}
            </p>
            <p className="whitespace-pre-wrap">{viewing.description}</p>
            <div>
              <h3 className="font-semibold">Tech stack</h3>
              <p className="mt-2">
                {viewing.stack.join(", ") || "No technologies added."}
              </p>
            </div>
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
        title="Delete Project"
        size="sm"
      >
        <div
          className="space-y-5 text-ink"
          aria-busy={isSubmitting}
        >
          <p>
            Delete “{deleting?.title}”? It will be removed from your portfolio
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
              onClick={() => void deleteProject()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {isSubmitting ? "Deleting…" : "Delete Project"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
