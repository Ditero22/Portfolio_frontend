import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type {
  Project,
  ProjectContribution,
} from "@/features/public/projects/types/project";
import {
  projectCategories,
  type ProjectCategory,
} from "@/features/public/projects/types/project";
import ProjectContributionEditor from "./ProjectContributionEditor";

const inputClass =
  "mt-2 block min-h-11 w-full rounded-xl border border-ink/15 bg-paper/70 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-60";

const textareaClass = `${inputClass} min-h-28 resize-y leading-6`;

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
  pendingCoverImage: File | null;
  uploadedCoverImageUrl: string | null;
  onCoverFileChange: (file: File | null) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-paper/35 p-4 sm:p-5">
      <div className="mb-5 flex gap-3 border-b border-ink/10 pb-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-teal-600/25 bg-teal-600/10 font-mono text-xs text-teal-800 dark:text-teal-200">
          {number}
        </span>
        <div>
          <h3 className="font-medium text-ink">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-ink/55">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return (
    <span className="mt-1.5 block text-xs leading-5 text-ink/55">
      {children}
    </span>
  );
}

export default function ProjectFormFields({
  editing,
  formError,
  hidden,
  isSubmitting,
  pendingCoverImage,
  uploadedCoverImageUrl,
  onCoverFileChange,
  onCancel,
  onSubmit,
}: ProjectFormFieldsProps) {
  const [category, setCategory] = useState<ProjectCategory>(
    editing?.category ?? "web",
  );
  const [contributions, setContributions] = useState<ProjectContribution[]>(
    () => editing?.contributions ?? [],
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    editing?.coverImageUrl ?? "",
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    editing?.coverImageUrl ?? "",
  );
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const coverFileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!localPreviewUrl) return;
    return () => URL.revokeObjectURL(localPreviewUrl);
  }, [localPreviewUrl]);

  const isNetworkingProject = category === "networking";

  function chooseCoverImage(file: File | null) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setImageError("Choose a JPG, PNG, WebP, or GIF image no larger than 5 MB.");
      if (coverFileInput.current) coverFileInput.current.value = "";
      setLocalPreviewUrl(null);
      onCoverFileChange(null);
      return;
    }

    setImageError(null);
    setCoverImageUrl("");
    setImagePreviewUrl("");
    setLocalPreviewUrl(URL.createObjectURL(file));
    setPreviewFailed(false);
    onCoverFileChange(file);
  }

  return (
    <form
      hidden={hidden}
      key={editing?.id ?? "new"}
      onSubmit={onSubmit}
      className="space-y-4 text-ink"
      aria-busy={isSubmitting}
    >
      <div className="rounded-xl border border-teal-600/15 bg-teal-600/5 px-4 py-3">
        <p className="text-sm font-medium">
          {editing ? "Update your project details" : "Add a project to your portfolio"}
        </p>
        <p className="mt-1 text-xs leading-5 text-ink/55">
          Start with the required details. You can add images and links when
          they’re available. Fields marked with * are required.
        </p>
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-300"
        >
          {formError}
        </p>
      )}

      <fieldset
        disabled={isSubmitting}
        className="space-y-4 disabled:opacity-60"
      >
        <FormSection
          number="01"
          title="Project basics"
          description="Identify the project and describe your contribution."
        >
          <label className="block text-sm font-medium text-ink">
            Project title <span className="text-teal-700">*</span>
            <input
              name="title"
              defaultValue={editing?.title ?? ""}
              required
              autoFocus={!editing}
              placeholder="Multi-Branch Office Network"
              className={inputClass}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Category <span className="text-teal-700">*</span>
              <select
                name="category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProjectCategory)
                }
                className={inputClass}
              >
                {projectCategories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-ink">
              Your role <span className="text-teal-700">*</span>
              <input
                name="role"
                defaultValue={editing?.role ?? ""}
                required
                placeholder="Network designer"
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-ink">
            Short description <span className="text-teal-700">*</span>
            <textarea
              name="description"
              defaultValue={editing?.description ?? ""}
              required
              rows={3}
              placeholder="What does the project do, and what problem does it address?"
              className={textareaClass}
            />
            <FieldHint>This summary appears on the project card.</FieldHint>
          </label>

          <label className="block text-sm font-medium text-ink">
            Project URL slug <span className="font-normal text-ink/45">Optional</span>
            <input
              name="slug"
              defaultValue={editing?.slug ?? ""}
              placeholder="multi-branch-office-network"
              className={inputClass}
            />
            <FieldHint>
              Leave blank to generate a short URL from the project title.
            </FieldHint>
          </label>
        </FormSection>

        <FormSection
          number="02"
          title="Build details"
          description="Add the context and technical details visitors can explore."
        >
          <label className="block text-sm font-medium text-ink">
            Full description <span className="font-normal text-ink/45">Optional</span>
            <textarea
              name="fullDescription"
              defaultValue={editing?.fullDescription ?? ""}
              rows={4}
              placeholder="Explain the design, how it works, and the decisions you made."
              className={textareaClass}
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Technologies and tools <span className="font-normal text-ink/45">Optional</span>
            <input
              name="stack"
              defaultValue={editing?.stack.join(", ") ?? ""}
              placeholder={
                isNetworkingProject
                  ? "Cisco Packet Tracer, VLAN, OSPF, DHCP"
                  : "React, TypeScript, PostgreSQL"
              }
              className={inputClass}
            />
            <FieldHint>
              Separate items with commas. Add only the tools and technologies
              used in this project.
            </FieldHint>
          </label>

          <label className="block text-sm font-medium text-ink">
            Features and implementation notes <span className="font-normal text-ink/45">Optional</span>
            <textarea
              name="highlights"
              defaultValue={editing?.highlights.join("\n") ?? ""}
              rows={4}
              placeholder={
                isNetworkingProject
                  ? "VLAN 10 separates staff devices from guest traffic.\nOSPF shares routes between branch routers.\nDHCP assigns addresses to client devices."
                  : "Add one feature, contribution, or result per line."
              }
              className={textareaClass}
            />
            <FieldHint>
              Add one note per line. For the Network Lab, mention the technology
              name in its note so visitors can filter by it.
            </FieldHint>
          </label>
        </FormSection>

        <FormSection
          number="03"
          title="Contribution map"
          description="Show visitors which parts were yours and which were handled by the team."
        >
          <input
            type="hidden"
            name="contributions"
            value={JSON.stringify(
              contributions.filter(
                (contribution) =>
                  contribution.title.trim() || contribution.details?.trim(),
              ),
            )}
          />
          <ProjectContributionEditor
            contributions={contributions}
            onChange={setContributions}
          />
        </FormSection>

        <FormSection
          number="04"
          title={isNetworkingProject ? "Topology and images" : "Images"}
          description={
            isNetworkingProject
              ? "Use a readable Packet Tracer screenshot as the topology preview."
              : "Add a cover image and any supporting screenshots."
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              {isNetworkingProject
                ? "Topology screenshot URL"
                : "Cover image URL"}{" "}
              <span className="font-normal text-ink/45">Optional</span>
              <input
                name="coverImageUrl"
                type="url"
                value={uploadedCoverImageUrl ?? coverImageUrl}
                onChange={(event) => {
                  setCoverImageUrl(event.target.value);
                  setImagePreviewUrl("");
                  setLocalPreviewUrl(null);
                  setPreviewFailed(false);
                  onCoverFileChange(null);
                  if (coverFileInput.current) coverFileInput.current.value = "";
                }}
                onBlur={() => setImagePreviewUrl(coverImageUrl.trim())}
                placeholder="https://…"
                className={inputClass}
              />
              <FieldHint>
                Paste a public image URL, or upload a screenshot beside it.
                Preview loads after you leave this field.
              </FieldHint>
            </label>

            <label className="block text-sm font-medium text-ink">
              {isNetworkingProject
                ? "Upload topology screenshot"
                : "Upload cover image"}{" "}
              <span className="font-normal text-ink/45">Optional</span>
              <input
                ref={coverFileInput}
                key={uploadedCoverImageUrl ?? "project-cover-image"}
                name="coverImageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  chooseCoverImage(event.target.files?.[0] ?? null)
                }
                className="mt-2 block min-h-11 w-full cursor-pointer rounded-xl border border-ink/15 bg-paper/70 text-sm text-ink file:mr-3 file:min-h-11 file:border-0 file:border-r file:border-ink/15 file:bg-ink/5 file:px-3 file:text-xs file:font-medium file:text-ink transition hover:border-teal-600/50 focus-visible:outline-2 focus-visible:outline-teal-600"
              />
              <FieldHint>
                JPG, PNG, WebP, or GIF · up to 5 MB. Upload starts after you
                confirm saving. A .pkt file isn’t an image preview.
              </FieldHint>
            </label>
          </div>

          {pendingCoverImage && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-600/15 bg-teal-600/5 px-4 py-3">
              <p className="text-xs leading-5 text-ink/65">
                <span className="block font-medium text-ink">
                  {pendingCoverImage.name}
                </span>
                Uploads to portfolio storage after confirmation.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLocalPreviewUrl(null);
                  setImagePreviewUrl("");
                  if (coverFileInput.current) coverFileInput.current.value = "";
                  onCoverFileChange(null);
                }}
                className="min-h-9 rounded-lg border border-ink/15 px-3 text-xs text-ink/65 transition hover:border-ink/35 hover:text-ink"
              >
                Remove image
              </button>
            </div>
          )}

          {imageError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-300">
              {imageError}
            </p>
          )}

          {(uploadedCoverImageUrl ||
            (pendingCoverImage ? localPreviewUrl : imagePreviewUrl)) && (
            <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface">
              {previewFailed ? (
                <p className="px-4 py-6 text-center text-xs text-ink/55">
                  The image preview couldn’t be loaded. Check the URL or keep
                  editing without a preview.
                </p>
              ) : (
                <img
                  src={
                    uploadedCoverImageUrl ??
                    (pendingCoverImage ? localPreviewUrl : imagePreviewUrl) ??
                    ""
                  }
                  alt={isNetworkingProject ? "Network topology preview" : "Project cover preview"}
                  onError={() => setPreviewFailed(true)}
                  className="max-h-64 w-full object-contain"
                />
              )}
            </div>
          )}

          <label className="block text-sm font-medium text-ink">
            Additional image URLs <span className="font-normal text-ink/45">Optional</span>
            <textarea
              name="images"
              defaultValue={editing?.images?.join("\n") ?? ""}
              rows={3}
              placeholder="https://image-one…\nhttps://image-two…"
              className={textareaClass}
            />
            <FieldHint>Add one public HTTP or HTTPS image URL per line.</FieldHint>
          </label>
        </FormSection>

        <FormSection
          number="05"
          title="Links and visibility"
          description="These fields are optional and can be updated later."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              GitHub or source URL <span className="font-normal text-ink/45">Optional</span>
              <input
                name="sourceUrl"
                type="url"
                defaultValue={editing?.sourceUrl ?? ""}
                placeholder="https://github.com/…"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Live demo URL <span className="font-normal text-ink/45">Optional</span>
              <input
                name="liveUrl"
                type="url"
                defaultValue={editing?.liveUrl ?? ""}
                placeholder="https://…"
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Project status
              <select
                name="status"
                defaultValue={editing?.status ?? "completed"}
                className={inputClass}
              >
                {projectStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-ink">
              Public visibility
              <select
                name="published"
                defaultValue={String(editing?.published ?? true)}
                className={inputClass}
              >
                <option value="true">Public — show on portfolio</option>
                <option value="false">Hidden — keep in admin</option>
              </select>
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-surface p-4 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={editing?.featured ?? false}
              className="mt-0.5 h-4 w-4 accent-teal-600"
            />
            <span>
              <span className="block font-medium text-ink">Feature this project</span>
              <span className="mt-1 block text-xs leading-5 text-ink/55">
                Mark this work as featured in project previews.
              </span>
            </span>
          </label>
        </FormSection>
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-5 flex justify-end gap-3 border-t border-ink/10 bg-surface/95 px-5 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-11 rounded-xl border border-ink/15 px-4 text-sm text-ink transition hover:border-ink/35 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-xl bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink/85 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving…"
            : editing
              ? "Review changes"
              : "Review project"}
        </button>
      </div>
    </form>
  );
}
