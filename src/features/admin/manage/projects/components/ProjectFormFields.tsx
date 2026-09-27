import type { FormEvent } from "react";
import type { Project } from "@/features/public/projects/types/project";
import { projectCategories } from "@/features/public/projects/types/project";

const inputClass =
  "mt-2 w-full rounded-md border border-ink/20 bg-surface px-3 py-2 text-ink";

const projectStatuses = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In progress" },
  { value: "planned", label: "Planned" },
] as const;

type ProjectFormFieldsProps = {
  editing: Project | null;
  formError: string | null;
  hidden: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ProjectFormFields({
  editing,
  formError,
  hidden,
  isSubmitting,
  onCancel,
  onSubmit,
}: ProjectFormFieldsProps) {
  return (
    <form
      hidden={hidden}
      key={editing?.id ?? "new"}
      onSubmit={onSubmit}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-ink">
            Category
            <select
              name="category"
              defaultValue={editing?.category ?? "web"}
              className={inputClass}
            >
              {projectCategories.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-ink">
            Project slug
            <span className="block text-xs text-ink/60">
              Leave blank on a new project to generate it from the title.
            </span>
            <input
              name="slug"
              defaultValue={editing?.slug ?? ""}
              placeholder="multi-branch-office-network"
              className={inputClass}
            />
          </label>
        </div>
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
          Short description
          <textarea
            name="description"
            defaultValue={editing?.description ?? ""}
            required
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-ink">
          Full description
          <textarea
            name="fullDescription"
            defaultValue={editing?.fullDescription ?? ""}
            rows={5}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-ink">
          Technologies and tools
          <span className="block text-xs text-ink/60">
            Separate values with commas. For networking, add tools and protocols
            such as Packet Tracer, routers, VLANs, OSPF, DHCP, or ACLs as
            needed.
          </span>
          <input
            name="stack"
            defaultValue={editing?.stack.join(", ") ?? ""}
            placeholder="React, TypeScript, PostgreSQL"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-ink">
            Cover image or network topology URL
            <input
              name="coverImageUrl"
              type="url"
              defaultValue={editing?.coverImageUrl ?? ""}
              placeholder="https://…"
              className={inputClass}
            />
          </label>
          <label className="block text-sm text-ink">
            Project status
            <select
              name="status"
              defaultValue={editing?.status ?? "completed"}
              className={inputClass}
            >
              {projectStatuses.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm text-ink">
          Additional image URLs
          <span className="block text-xs text-ink/60">
            Add one HTTP or HTTPS image URL per line.
          </span>
          <textarea
            name="images"
            defaultValue={editing?.images?.join("\n") ?? ""}
            rows={3}
            placeholder="https://…"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-ink">
            GitHub / source URL
            <input
              name="sourceUrl"
              type="url"
              defaultValue={editing?.sourceUrl ?? ""}
              placeholder="https://github.com/…"
              className={inputClass}
            />
          </label>
          <label className="block text-sm text-ink">
            Live / demo URL
            <input
              name="liveUrl"
              type="url"
              defaultValue={editing?.liveUrl ?? ""}
              placeholder="https://…"
              className={inputClass}
            />
          </label>
        </div>
        <label className="block text-sm text-ink">
          Features and highlights
          <span className="block text-xs text-ink/60">
            Add one item per line. Networking examples include VLANs, Inter-VLAN
            Routing, OSPF, DHCP, DNS, ACLs, and subnetting.
          </span>
          <textarea
            name="highlights"
            defaultValue={editing?.highlights.join("\n") ?? ""}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={editing?.featured ?? false}
            className="h-4 w-4 accent-teal-600"
          />
          Feature this project
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
          onClick={onCancel}
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
  );
}
