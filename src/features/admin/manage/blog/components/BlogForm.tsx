import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Button } from "@/shared/components/ui";
import type { BlogPostForm } from "@/features/public/blog/types/blog";

interface BlogFormProps {
  initialData?: BlogPostForm;
  onSubmit: (
    data: BlogPostForm,
    imageFile: File | null,
  ) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const emptyForm: BlogPostForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  slug: "",
  imageUrl: null,
  link: null,
  published: false,
};

function BlogForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BlogFormProps) {
  const [form, setForm] = useState<BlogPostForm>(
    initialData ?? emptyForm,
  );

  const [imageFile, setImageFile] = useState<File | null>(
    null,
  );

  const [imagePreview, setImagePreview] = useState<
    string | null
  >(initialData?.imageUrl ?? null);

  const fileInputRef = useRef<HTMLInputElement | null>(
    null,
  );

  useEffect(() => {
    setForm(initialData ?? emptyForm);
    setImageFile(null);
    setImagePreview(initialData?.imageUrl ?? null);
  }, [initialData]);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePublishedChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((current) => ({
      ...current,
      published: event.target.checked,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);

    setForm((current) => ({
      ...current,
      imageUrl: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onSubmit(form, imageFile);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm text-white/60"
        >
          Title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter blog title"
          required
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label
          htmlFor="excerpt"
          className="mb-2 block text-sm text-white/60"
        >
          Excerpt
        </label>

        <textarea
          id="excerpt"
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          placeholder="Short description of the blog post"
          rows={3}
          required
          className="w-full resize-none rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
        />
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="mb-2 block text-sm text-white/60"
        >
          Content
        </label>

        <textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Write your blog content..."
          rows={10}
          required
          className="w-full resize-y rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
        />
      </div>

      {/* Category + Slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm text-white/60"
          >
            Category
          </label>

          <input
            id="category"
            name="category"
            type="text"
            value={form.category}
            onChange={handleChange}
            placeholder="Technology"
            required
            className="w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm text-white/60"
          >
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            value={form.slug}
            onChange={handleChange}
            placeholder="my-first-blog"
            required
            className="w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <label
          htmlFor="image"
          className="mb-2 block text-sm text-white/60"
        >
          Featured Image
          <span className="ml-2 text-xs text-white/30">
            Optional
          </span>
        </label>

        <input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="block w-full cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:text-black hover:file:bg-white/80"
        />

        <p className="mt-2 text-xs text-white/30">
          JPG, PNG, WebP, or GIF. Maximum 5 MB.
        </p>

        {imagePreview && (
          <div className="mt-4 overflow-hidden rounded-md border border-white/10">
            <img
              src={imagePreview}
              alt="Featured image preview"
              className="max-h-80 w-full object-contain bg-black/20"
            />

            <div className="flex justify-end border-t border-white/10 p-3">
              <Button
                type="button"
                variant="danger"
                onClick={removeImage}
              >
                Remove Image
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Link */}
      <div>
        <label
          htmlFor="link"
          className="mb-2 block text-sm text-white/60"
        >
          External Link
          <span className="ml-2 text-xs text-white/30">
            Optional
          </span>
        </label>

        <input
          id="link"
          name="link"
          type="url"
          value={form.link ?? ""}
          onChange={handleChange}
          placeholder="https://example.com"
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
        />
      </div>

      {/* Published */}
      <label className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] p-4">
        <input
          type="checkbox"
          checked={form.published}
          onChange={handlePublishedChange}
          className="h-4 w-4 accent-white"
        />

        <div>
          <p className="text-sm text-white">
            Publish immediately
          </p>

          <p className="text-xs text-white/30">
            Leave unchecked to save this post as a draft.
          </p>
        </div>
      </label>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Save Changes"
              : "Create Post"}
        </Button>
      </div>
    </form>
  );
}

export default BlogForm;