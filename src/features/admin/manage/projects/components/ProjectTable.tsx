import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/features/public/projects/types/project";

const actionClass =
  "flex h-9 w-9 items-center justify-center rounded-md text-ink/70 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-ink";

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
  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-ink/15">
      <table className="w-full text-sm">
        <thead className="bg-ink/5">
          <tr>
            <th className="p-4 text-center">Order</th>
            <th className="p-4 text-left">Project</th>
            <th className="text-left">Category</th>
            <th className="text-left">Role</th>
            <th className="text-left">Visibility</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
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
                      index === 0 || isSubmitting || updatingVisibility !== null
                    }
                    title="Move up"
                    aria-label={`Move ${project.title} up`}
                    className={`${actionClass} disabled:opacity-30`}
                    onClick={() => onMove(index, -1)}
                  >
                    <ArrowUp
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    disabled={
                      index === projects.length - 1 ||
                      isSubmitting ||
                      updatingVisibility !== null
                    }
                    title="Move down"
                    aria-label={`Move ${project.title} down`}
                    className={`${actionClass} disabled:opacity-30`}
                    onClick={() => onMove(index, 1)}
                  >
                    <ArrowDown
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </td>
              <td className="p-4">{project.title}</td>
              <td className="capitalize">{project.category ?? "web"}</td>
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
                    onClick={() => onView(project)}
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
                    onClick={() => onEdit(project)}
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
                    onClick={() => onRequestVisibilityChange(project)}
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
                    onClick={() => onDelete(project)}
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
  );
}
