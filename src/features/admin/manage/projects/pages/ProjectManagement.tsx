import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { API_URL } from "@/shared/api";
import { Modal } from "@/shared/components/ui";
import { getAccessToken } from "@/features/auth/services/authStorage";
import type {
  Project,
  ProjectContribution,
} from "@/features/public/projects/types/project";
import { projectCategories } from "@/features/public/projects/types/project";
import { notifyProjectsChanged } from "@/features/public/projects/services/projects.service";
import ProjectContributionMap from "@/features/public/projects/components/ProjectContributionMap";
import { uploadProjectImage } from "../services/projectMedia.service";
import ProjectFormFields from "../components/ProjectFormFields";
import ProjectTable from "../components/ProjectTable";
import type { ProjectInput } from "../types/projectInput";

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
  const [pendingCoverImage, setPendingCoverImage] = useState<File | null>(null);
  const [uploadedCoverImageUrl, setUploadedCoverImageUrl] = useState<
    string | null
  >(null);
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
      setPendingCoverImage(null);
      setUploadedCoverImageUrl(null);
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
    const coverImage = data.get("coverImageFile");
    if (!title || !role || !description) {
      setFormError("Enter a title, role, and description.");
      return;
    }
    setPendingCoverImage(
      coverImage instanceof File && coverImage.size > 0 ? coverImage : null,
    );
    const contributionJson = data.get("contributions");
    if (typeof contributionJson !== "string") {
      setFormError("Could not read the project contribution details.");
      return;
    }

    let contributions: ProjectContribution[];
    try {
      const parsedContributions: unknown = JSON.parse(contributionJson);
      if (!Array.isArray(parsedContributions)) {
        throw new Error("Contribution details must be a list.");
      }
      contributions = parsedContributions as ProjectContribution[];
    } catch {
      setFormError("Check the project contribution details and try again.");
      return;
    }

    setFormError(null);
    setPendingSave({
      slug: value("slug"),
      title,
      category: value("category") as NonNullable<Project["category"]>,
      role,
      description,
      fullDescription: value("fullDescription"),
      stack: value("stack")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      highlights: value("highlights")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      contributions,
      coverImageUrl: value("coverImageUrl"),
      images: value("images")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      status: value("status") as NonNullable<Project["status"]>,
      sourceUrl: value("sourceUrl"),
      liveUrl: value("liveUrl"),
      featured: data.get("featured") === "on",
      published: data.get("published") === "true",
    });
  }

  async function saveProject() {
    if (!pendingSave || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setFormError(null);
    try {
      let projectData = pendingSave;
      if (pendingCoverImage) {
        const imageUrl = await uploadProjectImage(pendingCoverImage);
        projectData = { ...pendingSave, coverImageUrl: imageUrl };
        setPendingSave(projectData);
        setPendingCoverImage(null);
        setUploadedCoverImageUrl(imageUrl);
      }

      const response = await fetch(
        `${API_URL}/projects${editing ? `/${encodeURIComponent(editing.id)}` : ""}`,
        {
          method: editing ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
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
    <div className="max-w-5xl">
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
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-paper transition hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-50"
          onClick={() => {
            setEditing(null);
            setFormError(null);
            setPendingCoverImage(null);
            setUploadedCoverImageUrl(null);
            setShowForm(true);
          }}
        >
          <Plus size={16} aria-hidden="true" />
          Add project
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
      <ProjectTable
        projects={orderedItems}
        isSubmitting={isSubmitting}
        updatingVisibility={updatingVisibility}
        onMove={moveProject}
        onView={setViewing}
        onEdit={(project) => {
          setEditing(project);
          setFormError(null);
          setPendingCoverImage(null);
          setUploadedCoverImageUrl(null);
          setShowForm(true);
        }}
        onRequestVisibilityChange={(project) => {
          setVisibilityError(null);
          setVisibilityProject(project);
        }}
        onDelete={(project) => {
          setDeleteError(null);
          setDeleting(project);
        }}
      />
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
        title={
          pendingSave
            ? editing
              ? "Review Project Changes"
              : "Review New Project"
            : editing
              ? "Edit Project"
              : "Add Project"
        }
        size="xl"
      >
        {pendingSave && (
          <div
            className="space-y-5 text-ink"
            aria-busy={isSubmitting}
          >
            <p className="text-sm text-ink/65">
              Check the summary before saving. The project will be{" "}
              {pendingSave.published ? "visible" : "hidden"} on your portfolio.
            </p>
            <div className="rounded-2xl border border-ink/10 bg-paper/50 p-4 sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                {projectCategories.find(
                  (category) => category.value === pendingSave.category,
                )?.label ?? pendingSave.category}
                {" · "}
                {pendingSave.status.replaceAll("-", " ")}
              </p>
              <h3 className="mt-2 text-2xl text-ink">{pendingSave.title}</h3>
              <p className="mt-1 text-sm text-ink/55">
                {pendingSave.role} · {pendingSave.published ? "Public" : "Hidden"}
              </p>
              <p className="mt-4 text-sm leading-6 text-ink/70">
                {pendingSave.description}
              </p>
              <dl className="mt-4 grid gap-3 border-t border-ink/10 pt-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-ink/45">Technologies</dt>
                  <dd className="mt-1 font-medium text-ink">
                    {pendingSave.stack.length || "None added"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink/45">Images</dt>
                  <dd className="mt-1 font-medium text-ink">
                    {pendingSave.images.length +
                      (pendingSave.coverImageUrl || pendingCoverImage ? 1 : 0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink/45">Implementation notes</dt>
                  <dd className="mt-1 font-medium text-ink">
                    {pendingSave.highlights.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink/45">Contribution details</dt>
                  <dd className="mt-1 font-medium text-ink">
                    {pendingSave.contributions.length}
                  </dd>
                </div>
              </dl>
            </div>
            {formError && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-300"
              >
                {formError}
              </p>
            )}
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setPendingSave(null);
                  setFormError(null);
                }}
                className="min-h-11 rounded-xl border border-ink/15 px-4 text-sm transition hover:border-ink/35 disabled:opacity-50"
              >
                Back to editing
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void saveProject()}
                className="min-h-11 rounded-xl bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink/85 disabled:opacity-50"
              >
               {isSubmitting
                  ? pendingCoverImage
                    ? "Uploading image…"
                    : "Saving…"
                  : editing
                    ? "Confirm changes"
                    : "Create project"}
              </button>
            </div>
          </div>
        )}
        <ProjectFormFields
          key={editing?.id ?? "new"}
          editing={editing}
          formError={formError}
          hidden={pendingSave !== null}
          isSubmitting={isSubmitting}
          pendingCoverImage={pendingCoverImage}
          uploadedCoverImageUrl={uploadedCoverImageUrl}
          onCoverFileChange={(file) => {
            setPendingCoverImage(file);
            setUploadedCoverImageUrl(null);
          }}
          onCancel={closeForm}
          onSubmit={prepareSave}
        />
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
              {(viewing.category ?? "web").toUpperCase()} · {viewing.role} ·{" "}
              {viewing.published ? "Public" : "Hidden"}
            </p>
            <p className="whitespace-pre-wrap">{viewing.description}</p>
            {viewing.fullDescription && (
              <p className="whitespace-pre-wrap text-ink/70">
                {viewing.fullDescription}
              </p>
            )}
            {viewing.coverImageUrl && (
              <img
                src={viewing.coverImageUrl}
                alt={`${viewing.title} cover or network topology`}
                className="max-h-80 w-full rounded-xl border border-ink/10 bg-paper object-contain"
              />
            )}
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>Status: {viewing.status ?? "completed"}</p>
              <p>Slug: {viewing.slug ?? "Not assigned"}</p>
              <p>Featured: {viewing.featured ? "Yes" : "No"}</p>
              <p>Source: {viewing.sourceUrl || "Not provided"}</p>
              <p>Demo: {viewing.liveUrl || "Not provided"}</p>
            </div>
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
            <ProjectContributionMap
              contributions={viewing.contributions ?? []}
            />
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
    </div>
  );
}
