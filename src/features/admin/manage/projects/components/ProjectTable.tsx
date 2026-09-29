import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";

import type { Project } from "@/features/public/projects/types/project";
import {
  AdminIconAction,
  AdminStatusBadge,
  Table,
} from "@/shared/components/ui";

type ProjectTableProps = {
  projects: Project[];
  isSubmitting: boolean;
  updatingVisibility: string | null;
  onMove: (index: number, direction: number) => void;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onRequestVisibilityChange: (project: Project) => void;
  onDelete: (project: Project) => void;
};

function ProjectOrderControls({
  project,
  index,
  length,
  disabled,
  onMove,
}: {
  project: Project;
  index: number;
  length: number;
  disabled: boolean;
  onMove: (index: number, direction: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="min-w-6 text-center font-mono text-xs tabular-nums text-ink/55">
        {String(index + 1).padStart(2, "0")}
      </span>
      <AdminIconAction
        icon={<ArrowUp size={15} aria-hidden="true" />}
        label={`Move ${project.title} up`}
        title="Move up"
        disabled={index === 0 || disabled}
        onClick={() => onMove(index, -1)}
      />
      <AdminIconAction
        icon={<ArrowDown size={15} aria-hidden="true" />}
        label={`Move ${project.title} down`}
        title="Move down"
        disabled={index === length - 1 || disabled}
        onClick={() => onMove(index, 1)}
      />
    </div>
  );
}

function VisibilityControl({
  project,
  onRequestChange,
  compact = false,
}: {
  project: Project;
  onRequestChange: () => void;
  compact?: boolean;
}) {
  const nextStatus = project.published ? "hide" : "publish";

  return (
    <button
      type="button"
      aria-label={`${nextStatus === "hide" ? "Hide" : "Publish"} ${project.title}; currently ${project.published ? "public" : "hidden"}`}
      title={project.published ? "Public — click to hide" : "Hidden — click to publish"}
      onClick={onRequestChange}
      className={`inline-flex min-h-9 items-center gap-2 rounded-lg p-1.5 text-xs text-ink/65 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500 ${compact ? "flex-col gap-1" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${project.published ? "bg-teal-600" : "bg-ink/25"}`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${project.published ? "translate-x-4" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

export default function ProjectTable({
  projects,
  isSubmitting,
  updatingVisibility,
  onMove,
  onView,
  onEdit,
  onRequestVisibilityChange,
  onDelete,
}: ProjectTableProps) {
  const movementDisabled = isSubmitting || updatingVisibility !== null;

  return (
    <Table<Project>
      ariaLabel="Projects"
      className="mt-8"
      data={projects}
      emptyMessage="No projects yet. Add a project to start building your portfolio."
      getRowKey={(project) => project.id}
      minWidthClassName="min-w-[880px]"
      columns={[
        {
          key: "order",
          label: "Order",
          headerClassName: "w-36 text-center",
          cellClassName: "w-36",
          render: (project, index) => (
            <ProjectOrderControls
              project={project}
              index={index}
              length={projects.length}
              disabled={movementDisabled}
              onMove={onMove}
            />
          ),
        },
        {
          key: "project",
          label: "Project",
          headerClassName: "w-[24%]",
          cellClassName: "max-w-64 whitespace-normal break-words [overflow-wrap:anywhere] font-medium text-ink",
          render: (project) => project.title,
        },
        {
          key: "category",
          label: "Category",
          headerClassName: "w-28",
          cellClassName: "capitalize text-ink/65",
          render: (project) => project.category ?? "web",
        },
        {
          key: "role",
          label: "Role",
          headerClassName: "w-[20%]",
          cellClassName: "max-w-56 whitespace-normal break-words [overflow-wrap:anywhere] text-ink/65",
          render: (project) => project.role || "—",
        },
        {
          key: "visibility",
          label: "Visibility",
          headerClassName: "w-28",
          render: (project) => (
            <AdminStatusBadge
              variant={project.published ? "public" : "quiet"}
            >
              {project.published ? "Public" : "Hidden"}
            </AdminStatusBadge>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          headerClassName: "w-48 text-center",
          cellClassName: "whitespace-nowrap",
          render: (project) => (
            <fieldset
              disabled={updatingVisibility !== null}
              className="flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <legend className="sr-only">Actions for {project.title}</legend>
              <AdminIconAction
                icon={<Eye size={17} aria-hidden="true" />}
                label={`View ${project.title}`}
                title="View project"
                hasDialog
                onClick={() => onView(project)}
              />
              <AdminIconAction
                icon={<Pencil size={17} aria-hidden="true" />}
                label={`Edit ${project.title}`}
                title="Edit project"
                hasDialog
                onClick={() => onEdit(project)}
              />
              <VisibilityControl
                project={project}
                compact
                onRequestChange={() => onRequestVisibilityChange(project)}
              />
              <AdminIconAction
                icon={<Trash2 size={17} aria-hidden="true" />}
                label={`Delete ${project.title}`}
                title="Delete project"
                variant="danger"
                hasDialog
                onClick={() => onDelete(project)}
              />
            </fieldset>
          ),
        },
      ]}
      renderMobileItem={(project, index) => (
        <article className="rounded-2xl border border-ink/12 bg-surface p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words font-semibold text-ink [overflow-wrap:anywhere]">
                {project.title}
              </h2>
              <p className="mt-1 break-words text-xs capitalize text-ink/55 [overflow-wrap:anywhere]">
                {project.category ?? "web"} <span aria-hidden="true">·</span>{" "}
                {project.role || "Role not specified"}
              </p>
            </div>
            <AdminStatusBadge
              variant={project.published ? "public" : "quiet"}
            >
              {project.published ? "Public" : "Hidden"}
            </AdminStatusBadge>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
              Display order
            </span>
            <ProjectOrderControls
              project={project}
              index={index}
              length={projects.length}
              disabled={movementDisabled}
              onMove={onMove}
            />
          </div>
          <fieldset
            disabled={updatingVisibility !== null}
            className="mt-3 grid grid-cols-4 gap-1 border-t border-ink/10 pt-3 disabled:opacity-50"
          >
            <legend className="sr-only">Actions for {project.title}</legend>
            <button
              type="button"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-ink/65 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-teal-500"
              aria-label={`View ${project.title}`}
              onClick={() => onView(project)}
            >
              <Eye size={17} aria-hidden="true" />
              <span className="text-[10px]">View</span>
            </button>
            <button
              type="button"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-ink/65 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-teal-500"
              aria-label={`Edit ${project.title}`}
              onClick={() => onEdit(project)}
            >
              <Pencil size={17} aria-hidden="true" />
              <span className="text-[10px]">Edit</span>
            </button>
            <VisibilityControl
              project={project}
              compact
              onRequestChange={() => onRequestVisibilityChange(project)}
            />
            <button
              type="button"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-red-600/75 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
              aria-label={`Delete ${project.title}`}
              onClick={() => onDelete(project)}
            >
              <Trash2 size={17} aria-hidden="true" />
              <span className="text-[10px]">Delete</span>
            </button>
          </fieldset>
        </article>
      )}
    />
  );
}
