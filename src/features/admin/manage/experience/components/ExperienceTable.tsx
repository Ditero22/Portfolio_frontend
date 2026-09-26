import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";
import type { Experience } from "@/features/public/experience/types/experience";
import { experiencePeriod } from "@/features/public/experience/utils/experiencePeriod";
const actionClass =
  "flex h-9 w-9 items-center justify-center rounded-md text-ink/70 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-ink";
interface Props {
  orderedItems: Experience[];
  loadError: string | null;
  isSubmitting: boolean;
  updatingVisibility: string | null;
  moveExperience: (index: number, direction: number) => void;
  onView: (item: Experience) => void;
  onEdit: (item: Experience) => void;
  onVisibility: (item: Experience) => void;
  onDelete: (item: Experience) => void;
}
export default function ExperienceTable({
  orderedItems,
  loadError,
  isSubmitting,
  updatingVisibility,
  moveExperience,
  onView,
  onEdit,
  onVisibility,
  onDelete,
}: Props) {
  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-ink/15">
      <table className="w-full text-sm">
        <thead className="bg-ink/5">
          <tr>
            <th className="p-4 text-center">Order</th>
            <th className="p-4 text-left">Company</th>
            <th className="text-left">Role</th>
            <th className="p-4 text-left">Dates</th>
            <th className="text-left">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orderedItems.length === 0 && !loadError && (
            <tr>
              <td
                colSpan={6}
                className="p-6 text-center text-ink/60"
              >
                No experience entries yet. Add your first role using New
                Experience.
              </td>
            </tr>
          )}
          {orderedItems.map((experience, index) => (
            <tr
              key={experience.id}
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
                    aria-label={`Move ${experience.company} up`}
                    className={`${actionClass} disabled:opacity-30`}
                    onClick={() => moveExperience(index, -1)}
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
                    aria-label={`Move ${experience.company} down`}
                    className={`${actionClass} disabled:opacity-30`}
                    onClick={() => moveExperience(index, 1)}
                  >
                    <ArrowDown
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </td>
              <td className="p-4">{experience.company}</td>
              <td>{experience.role}</td>
              <td className="whitespace-nowrap p-4 text-ink/60">
                {experiencePeriod(experience)}
              </td>
              <td>{experience.published ? "Public" : "Hidden"}</td>
              <td className="p-4 align-middle">
                <fieldset
                  disabled={updatingVisibility !== null}
                  className="flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <button
                    type="button"
                    className={actionClass}
                    title="View"
                    aria-label={`View ${experience.company}`}
                    onClick={() => onView(experience)}
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
                    aria-label={`Edit ${experience.company}`}
                    onClick={() => onEdit(experience)}
                  >
                    <Pencil
                      size={18}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={experience.published}
                    aria-label={`Public visibility for ${experience.company}`}
                    title={
                      experience.published
                        ? "Public — click to hide"
                        : "Hidden — click to publish"
                    }
                    className="flex h-9 w-12 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-ink"
                    onClick={() => onVisibility(experience)}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${experience.published ? "bg-ink" : "bg-ink/25"}`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-paper shadow-sm transition-transform ${experience.published ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${actionClass} hover:text-red-500`}
                    title="Delete"
                    aria-label={`Delete ${experience.company}`}
                    onClick={() => onDelete(experience)}
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
