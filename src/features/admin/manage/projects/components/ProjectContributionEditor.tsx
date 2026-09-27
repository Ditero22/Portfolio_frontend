import { Plus, Trash2 } from "lucide-react";
import {
  projectContributionKinds,
  type ProjectContribution,
} from "@/features/public/projects/types/project";

type ProjectContributionEditorProps = {
  contributions: ProjectContribution[];
  onChange: (contributions: ProjectContribution[]) => void;
};

const fieldClass =
  "mt-2 block min-h-11 w-full rounded-xl border border-ink/15 bg-paper/70 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

export default function ProjectContributionEditor({
  contributions,
  onChange,
}: ProjectContributionEditorProps) {
  function updateContribution(
    index: number,
    update: Partial<ProjectContribution>,
  ) {
    onChange(
      contributions.map((contribution, currentIndex) =>
        currentIndex === index ? { ...contribution, ...update } : contribution,
      ),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-ink/55">
          Separate your work from work handled by the team.
        </p>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...contributions,
              { kind: "built", title: "", details: "" },
            ])
          }
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink/15 px-3 text-xs font-medium text-ink transition hover:border-teal-600/40 hover:bg-teal-600/5 focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <Plus size={14} aria-hidden="true" />
          Add contribution
        </button>
      </div>

      {contributions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/15 bg-paper/40 px-4 py-5 text-sm leading-6 text-ink/55">
          Add the parts you personally built, designed, or supported, plus any
          major areas handled by the team.
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((contribution, index) => (
            <fieldset
              key={index}
              className="rounded-xl border border-ink/10 bg-surface p-4"
            >
              <legend className="sr-only">Contribution {index + 1}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink">
                  Contribution type
                  <select
                    aria-label={`Contribution ${index + 1} type`}
                    value={contribution.kind}
                    onChange={(event) =>
                      updateContribution(index, {
                        kind: event.target
                          .value as ProjectContribution["kind"],
                      })
                    }
                    className={fieldClass}
                  >
                    {projectContributionKinds.map((kind) => (
                      <option key={kind.value} value={kind.value}>
                        {kind.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-ink">
                  Part or task
                  <input
                    aria-label={`Contribution ${index + 1} part or task`}
                    value={contribution.title}
                    onChange={(event) =>
                      updateContribution(index, { title: event.target.value })
                    }
                    maxLength={160}
                    placeholder="Flutter mobile app UI"
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm font-medium text-ink">
                Details <span className="font-normal text-ink/45">Optional</span>
                <textarea
                  aria-label={`Contribution ${index + 1} details`}
                  value={contribution.details ?? ""}
                  onChange={(event) =>
                    updateContribution(index, { details: event.target.value })
                  }
                  maxLength={500}
                  rows={2}
                  placeholder="Describe the work or clarify how responsibilities were shared."
                  className={`${fieldClass} min-h-20 resize-y leading-6`}
                />
              </label>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      contributions.filter(
                        (_item, currentIndex) => currentIndex !== index,
                      ),
                    )
                  }
                  aria-label={`Remove contribution ${index + 1}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs text-red-600 transition hover:bg-red-500/5 focus-visible:outline-2 focus-visible:outline-red-500 dark:text-red-300"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Remove
                </button>
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}
