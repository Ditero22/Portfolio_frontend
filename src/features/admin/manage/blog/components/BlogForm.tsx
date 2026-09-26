import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/shared/components/ui";
import BlogArticle from "@/features/public/blog/components/BlogArticle";
import {
  parseContent,
  serializeContent,
} from "@/features/public/blog/types/content";
import type {
  Alignment,
  BlogBlock,
  TextStyle,
} from "@/features/public/blog/types/content";
import type { BlogPostForm } from "@/features/public/blog/types/blog";
import { uploadBlogImage } from "../services/blog.service";

interface Props {
  initialData?: BlogPostForm;
  onSubmit: (data: BlogPostForm, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onBusyChange: (busy: boolean) => void;
  errorMessage?: string | null;
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
const inputClass =
  "w-full rounded-md border border-ink/20 bg-ink/[0.03] px-3 py-2 text-sm text-ink placeholder:text-ink/40";
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const blockNames: Record<BlogBlock["type"], string> = {
  text: "Text",
  image: "Image",
  "featured-image": "Featured image",
  quote: "Quote",
  link: "Link",
  embed: "Embed",
};
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function safeRichText(value: string) {
  const root = new DOMParser().parseFromString(value, "text/html").body;
  const format = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE)
      return escapeHtml(node.textContent ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = (node as Element).tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(format).join("");
    if (tag === "br") return "<br>";
    return ["strong", "b"].includes(tag)
      ? `<strong>${children}</strong>`
      : ["em", "i"].includes(tag)
        ? `<em>${children}</em>`
        : tag === "u"
          ? `<u>${children}</u>`
          : children;
  };
  return Array.from(root.childNodes).map(format).join("");
}

function editorHtml(value: string) {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return safeRichText(value);
  return escapeHtml(value)
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
    .replace(/\+\+([\s\S]+?)\+\+/g, "<u>$1</u>")
    .replace(/\n/g, "<br>");
}

function RichTextField({
  value,
  alignment,
  onChange,
}: {
  value: string;
  alignment: Alignment;
  onChange: (value: string) => void;
}) {
  const field = useRef<HTMLDivElement>(null);
  const html = editorHtml(value);

  // Updating innerHTML on every keystroke resets the caret, especially in centered text.
  // Only sync it when a change came from outside this field.
  useEffect(() => {
    if (field.current && field.current.innerHTML !== html)
      field.current.innerHTML = html;
  }, [html]);

  return (
    <div
      ref={field}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      tabIndex={0}
      onInput={(event) => onChange(safeRichText(event.currentTarget.innerHTML))}
      style={{ textAlign: alignment }}
      className={`${inputClass} min-h-32 whitespace-pre-wrap`}
      data-placeholder="Write your content…"
    />
  );
}

function createBlock(type: BlogBlock["type"]): BlogBlock {
  const id = crypto.randomUUID();
  if (type === "text")
    return { id, type, text: "", alignment: "left", style: "paragraph" };
  if (type === "quote")
    return { id, type, text: "", citation: "", alignment: "left" };
  if (type === "link")
    return {
      id,
      type,
      text: "",
      href: "",
      appearance: "inline",
      alignment: "left",
    };
  if (type === "embed")
    return { id, type, url: "", caption: "", alignment: "center" };
  if (type === "featured-image")
    return {
      id,
      type,
      alt: "",
      caption: "",
      alignment: "center",
      width: "full",
    };
  return {
    id,
    type,
    src: "",
    alt: "",
    caption: "",
    alignment: "center",
    width: "full",
  };
}

export default function BlogForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onBusyChange,
  errorMessage,
}: Props) {
  const [form, setForm] = useState<BlogPostForm>(
    () => initialData ?? emptyForm,
  );
  const [blocks, setBlocks] = useState<BlogBlock[]>(() =>
    initialData ? parseContent(initialData.content) : [],
  );
  const [files, setFiles] = useState<Record<string, File>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl ?? null,
  );
  const [preview, setPreview] = useState(false);
  const [stage, setStage] = useState<"compose" | "details">("compose");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrls = useRef(new Set<string>());
  const featuredInput = useRef<HTMLInputElement>(null);
  const busy = uploading || isSubmitting;
  const savingRef = useRef(false);
  const [confirmation, setConfirmation] = useState<{
    message: string;
    label: string;
    action: () => void;
  } | null>(null);

  useEffect(() => () => objectUrls.current.forEach(URL.revokeObjectURL), []);

  function addBlock(type: BlogBlock["type"]) {
    setBlocks((current) => [...current, createBlock(type)]);
  }

  function updateBlock(id: string, patch: Partial<BlogBlock>) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? ({ ...block, ...patch } as BlogBlock) : block,
      ),
    );
  }

  function formatSelectedText(command: "bold" | "italic" | "underline") {
    document.execCommand(command);
  }

  function moveBlock(index: number, direction: number) {
    setBlocks((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  function previewFile(file: File): string | undefined {
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPG, PNG, WebP, or GIF image no larger than 5 MB.");
      return undefined;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    return url;
  }

  function chooseBlockImage(id: string, file: File) {
    const src = previewFile(file);
    if (!src) return;
    setFiles((current) => ({ ...current, [id]: file }));
    updateBlock(id, { src });
  }

  function draftMetadata(data: BlogPostForm): BlogPostForm {
    return {
      ...data,
      // The API assigns an ordered title such as "Draft 1" when this is blank.
      title: data.title.trim(),
      excerpt: data.excerpt.trim(),
      category: data.category.trim(),
      slug: data.slug.trim(),
      published: false,
    };
  }

  async function savePost(data: BlogPostForm) {
    if (busy || savingRef.current) return;
    setError(null);
    if (
      !blocks.some(
        (block) =>
          block.type === "text" ||
          block.type === "quote" ||
          block.type === "link" ||
          block.type === "embed" ||
          (block.type === "image" && block.src) ||
          (block.type === "featured-image" && imagePreview),
      )
    ) {
      setError("Add at least one content block.");
      return;
    }
    savingRef.current = true;
    setUploading(true);
    onBusyChange(true);
    try {
      const savedBlocks = [...blocks];
      for (let index = 0; index < savedBlocks.length; index++) {
        const block = savedBlocks[index];
        if (block.type === "image" && files[block.id]) {
          const src = await uploadBlogImage(files[block.id]);
          savedBlocks[index] = { ...block, src };
        }
      }
      await onSubmit(
        { ...data, content: serializeContent(savedBlocks) },
        imageFile,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save post.");
    } finally {
      savingRef.current = false;
      setUploading(false);
      onBusyChange(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) return;
    setConfirmation({
      message: form.published
        ? "Publish this post? It will become visible to everyone on your public blog."
        : "Save this post as a draft? It will be hidden from your public blog.",
      label: form.published ? "Confirm publish" : "Save draft",
      action: () => void savePost(form),
    });
  }

  function hasContent() {
    return blocks.some(
      (block) =>
        block.type === "text" ||
        block.type === "quote" ||
        block.type === "link" ||
        block.type === "embed" ||
        (block.type === "image" && block.src) ||
        (block.type === "featured-image" && imagePreview),
    );
  }

  function closeEditor() {
    if (busy) return;
    if (!initialData && hasContent()) {
      setConfirmation({
        message: "Save this post as a draft and close the editor?",
        label: "Save draft & close",
        action: () => void savePost(draftMetadata(form)),
      });
      return;
    }
    if (initialData) {
      setConfirmation({
        message: "Close without saving these changes?",
        label: "Discard changes",
        action: onCancel,
      });
      return;
    }
    onCancel();
  }

  const previewPost = {
    ...form,
    imageUrl: imagePreview,
    content: serializeContent(blocks),
  };
  if (confirmation) {
    return (
      <div className="space-y-5 text-ink">
        <h3 className="text-xl">Confirm action</h3>
        <p>{confirmation.message}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={() => setConfirmation(null)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              const action = confirmation.action;
              setConfirmation(null);
              action();
            }}
          >
            {confirmation.label}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {(error || errorMessage) && (
        <p
          role="alert"
          className="rounded-md border border-red-500/30 p-3 text-sm text-red-500"
        >
          {error || errorMessage}
        </p>
      )}
      <fieldset
        disabled={busy}
        className="space-y-5 disabled:opacity-70"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink/15 pb-4">
          <div
            className="flex gap-2"
            aria-label="Editor view"
          >
            <Button
              onClick={() => setPreview(false)}
              aria-pressed={!preview}
              variant={!preview ? "primary" : "default"}
            >
              Edit
            </Button>
            <Button
              onClick={() => setPreview(true)}
              aria-pressed={preview}
              variant={preview ? "primary" : "default"}
            >
              Preview
            </Button>
            {!preview && (
              <Button onClick={() => void savePost(draftMetadata(form))}>
                Save draft
              </Button>
            )}
          </div>
          <span className="text-xs text-ink/60">
            WordPress-style block editor
          </span>
        </div>

        {!preview ? (
          <>
            {stage === "details" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-ink">Post details</h2>
                    <p className="text-xs text-ink/60">
                      Give the article its title and publishing details after
                      you finish writing.
                    </p>
                  </div>
                  <Button onClick={() => setStage("compose")}>
                    ← Back to editor
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm text-ink/80">
                    Title
                    <input
                      required
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-ink/80">
                    Slug
                    <input
                      required
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      title="Use lowercase letters, numbers, and hyphens."
                      value={form.slug}
                      onChange={(event) =>
                        setForm({ ...form, slug: event.target.value })
                      }
                      className={inputClass}
                      placeholder="my-first-post"
                    />
                  </label>
                </div>
                <label className="block space-y-2 text-sm text-ink/80">
                  Excerpt
                  <textarea
                    required
                    rows={3}
                    value={form.excerpt}
                    onChange={(event) =>
                      setForm({ ...form, excerpt: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-2 text-sm text-ink/80">
                  Category
                  <input
                    required
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>

                <section className="space-y-3 rounded-md border border-ink/15 p-4">
                  <div>
                    <h2 className="text-xl text-ink">Featured image</h2>
                    <p className="text-xs text-ink/60">
                      Shown on the blog list. Add a Featured image block below
                      to position it inside the article.
                    </p>
                  </div>
                  <input
                    ref={featuredInput}
                    type="file"
                    accept={allowedTypes.join(",")}
                    className={inputClass}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const src = previewFile(file);
                      if (!src) {
                        event.target.value = "";
                        return;
                      }
                      setImageFile(file);
                      setImagePreview(src);
                    }}
                  />
                  {imagePreview && (
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Featured image preview"
                        className="h-20 w-28 rounded object-cover"
                      />
                      <Button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setForm({ ...form, imageUrl: null });
                          if (featuredInput.current)
                            featuredInput.current.value = "";
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </section>
              </>
            )}

            {stage === "compose" && (
              <section
                aria-label="Content blocks"
                className="space-y-4"
              >
                <div className="sticky top-0 z-10 space-y-3 rounded-md border border-ink/20 bg-paper p-4 shadow-sm">
                  <div>
                    <h2 className="text-2xl text-ink">Add a block</h2>
                    <p className="text-xs text-ink/60">
                      Choose a block, then style and arrange it below.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => addBlock("text")}>+ Text</Button>
                    <Button onClick={() => addBlock("image")}>+ Image</Button>
                    <Button onClick={() => addBlock("featured-image")}>
                      + Featured image
                    </Button>
                    <Button onClick={() => addBlock("quote")}>+ Quote</Button>
                    <Button onClick={() => addBlock("link")}>+ Link</Button>
                    <Button onClick={() => addBlock("embed")}>+ Embed</Button>
                  </div>
                </div>

                {blocks.length === 0 && (
                  <p className="rounded-md border border-dashed border-ink/25 p-8 text-center text-sm text-ink/60">
                    Start by choosing a block above.
                  </p>
                )}
                {blocks.map((block, index) => (
                  <section
                    key={block.id}
                    className="space-y-3 rounded-md border border-ink/20 bg-ink/[0.02] p-4"
                  >
                    <header className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm text-ink">
                        {index + 1}. {blockNames[block.type]}
                      </strong>
                      <div className="flex gap-1">
                        <Button
                          disabled={index === 0}
                          onClick={() => moveBlock(index, -1)}
                          aria-label={`Move ${blockNames[block.type]} up`}
                        >
                          ↑
                        </Button>
                        <Button
                          disabled={index === blocks.length - 1}
                          onClick={() => moveBlock(index, 1)}
                          aria-label={`Move ${blockNames[block.type]} down`}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() =>
                            setBlocks((current) =>
                              current.filter((item) => item.id !== block.id),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </header>
                    {block.type !== "text" && (
                      <label className="block max-w-xs space-y-1 text-xs text-ink/70">
                        Alignment
                        <select
                          value={block.alignment}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              alignment: event.target.value as Alignment,
                            })
                          }
                          className={inputClass}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                    )}
                    {block.type === "text" && (
                      <>
                        <label className="block max-w-xs space-y-1 text-xs text-ink/70">
                          Design
                          <select
                            value={block.style ?? "paragraph"}
                            onChange={(event) =>
                              updateBlock(block.id, {
                                style: event.target.value as TextStyle,
                              })
                            }
                            className={inputClass}
                          >
                            <option value="paragraph">Paragraph</option>
                            <option value="lead">Large lead text</option>
                            <option value="heading">Section heading</option>
                          </select>
                        </label>
                        <div className="flex flex-wrap items-center gap-2 rounded-md border border-ink/15 bg-paper p-2">
                          <span className="mr-1 text-xs text-ink/60">
                            Text:
                          </span>
                          <Button
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => formatSelectedText("bold")}
                            aria-label="Make selected text bold"
                          >
                            <strong>B</strong>
                          </Button>
                          <Button
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => formatSelectedText("italic")}
                            aria-label="Make selected text italic"
                          >
                            <em>I</em>
                          </Button>
                          <Button
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => formatSelectedText("underline")}
                            aria-label="Underline selected text"
                          >
                            <u>U</u>
                          </Button>
                          <span className="ml-2 text-xs text-ink/60">
                            Align:
                          </span>
                          <Button
                            onClick={() =>
                              updateBlock(block.id, { alignment: "left" })
                            }
                            variant={
                              block.alignment === "left" ? "primary" : "default"
                            }
                            aria-label="Align text left"
                          >
                            Left
                          </Button>
                          <Button
                            onClick={() =>
                              updateBlock(block.id, { alignment: "center" })
                            }
                            variant={
                              block.alignment === "center"
                                ? "primary"
                                : "default"
                            }
                            aria-label="Center text"
                          >
                            Center
                          </Button>
                          <Button
                            onClick={() =>
                              updateBlock(block.id, { alignment: "right" })
                            }
                            variant={
                              block.alignment === "right"
                                ? "primary"
                                : "default"
                            }
                            aria-label="Align text right"
                          >
                            Right
                          </Button>
                        </div>
                        <RichTextField
                          value={block.text}
                          alignment={block.alignment}
                          onChange={(text) => updateBlock(block.id, { text })}
                        />
                      </>
                    )}
                    {block.type === "quote" && (
                      <>
                        <textarea
                          rows={3}
                          value={block.text}
                          onChange={(event) =>
                            updateBlock(block.id, { text: event.target.value })
                          }
                          className={inputClass}
                          placeholder="Write the quote…"
                        />
                        <input
                          value={block.citation}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              citation: event.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder="Who said it? (optional)"
                        />
                      </>
                    )}
                    {block.type === "link" && (
                      <>
                        <input
                          value={block.text}
                          onChange={(event) =>
                            updateBlock(block.id, { text: event.target.value })
                          }
                          className={inputClass}
                          placeholder="Link text"
                        />
                        <input
                          type="url"
                          value={block.href}
                          onChange={(event) =>
                            updateBlock(block.id, { href: event.target.value })
                          }
                          className={inputClass}
                          placeholder="https://example.com"
                        />
                        <label className="block max-w-xs space-y-1 text-xs text-ink/70">
                          Design
                          <select
                            value={block.appearance}
                            onChange={(event) =>
                              updateBlock(block.id, {
                                appearance: event.target.value as
                                  "inline" | "button" | "card",
                              })
                            }
                            className={inputClass}
                          >
                            <option value="inline">Inline link</option>
                            <option value="button">Button</option>
                            <option value="card">Link card</option>
                          </select>
                        </label>
                      </>
                    )}
                    {block.type === "embed" && (
                      <>
                        <input
                          type="url"
                          value={block.url}
                          onChange={(event) =>
                            updateBlock(block.id, { url: event.target.value })
                          }
                          className={inputClass}
                          placeholder="Paste a YouTube or Vimeo link"
                        />
                        <input
                          value={block.caption}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              caption: event.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder="Caption (optional)"
                        />
                        <p className="text-xs text-ink/60">
                          Public YouTube and Vimeo videos are supported.
                        </p>
                      </>
                    )}
                    {(block.type === "image" ||
                      block.type === "featured-image") && (
                      <>
                        <label className="block max-w-xs space-y-1 text-xs text-ink/70">
                          Image width
                          <select
                            value={block.width}
                            onChange={(event) =>
                              updateBlock(block.id, {
                                width: event.target.value as
                                  "small" | "medium" | "full",
                              })
                            }
                            className={inputClass}
                          >
                            <option value="small">Small · 40%</option>
                            <option value="medium">Medium · 70%</option>
                            <option value="full">Full width</option>
                          </select>
                        </label>
                        {block.type === "image" && (
                          <>
                            <input
                              type="file"
                              accept={allowedTypes.join(",")}
                              className={inputClass}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) chooseBlockImage(block.id, file);
                              }}
                            />
                            <p className="text-xs text-ink/60">
                              Choose an image to upload to R2 when you save.
                            </p>
                          </>
                        )}
                        {block.type === "featured-image" && !imagePreview && (
                          <p className="text-sm text-ink/60">
                            Choose a featured image above first.
                          </p>
                        )}
                        {(block.type === "image"
                          ? block.src
                          : imagePreview) && (
                          <img
                            src={
                              (block.type === "image"
                                ? block.src
                                : imagePreview) || undefined
                            }
                            alt="Block preview"
                            className="max-h-48 rounded object-contain"
                          />
                        )}
                        <input
                          value={block.alt}
                          onChange={(event) =>
                            updateBlock(block.id, { alt: event.target.value })
                          }
                          className={inputClass}
                          placeholder="Describe this image for screen readers"
                        />
                        <input
                          value={block.caption}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              caption: event.target.value,
                            })
                          }
                          className={inputClass}
                          placeholder="Caption (optional)"
                        />
                      </>
                    )}
                  </section>
                ))}
              </section>
            )}
          </>
        ) : (
          <div className="rounded-md border border-ink/15 bg-paper p-5">
            <BlogArticle
              post={previewPost}
              preview
            />
          </div>
        )}
        {stage === "details" && !preview && (
          <label className="flex items-center gap-3 rounded-md border border-ink/15 p-4 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => {
                const next = event.target.checked;
                const message = next
                  ? "Make this post public?"
                  : "Hide this post from the public blog and keep it as a draft?";
                setConfirmation({
                  message: `${message} This takes effect when you save the post.`,
                  label: next ? "Make public" : "Keep as draft",
                  action: () =>
                    setForm((current) => ({ ...current, published: next })),
                });
              }}
              className="accent-ink"
            />
            <span>
              Publish post
              <span className="block text-xs text-ink/60">
                Unchecked posts stay in Drafts and are hidden from the public.
              </span>
            </span>
          </label>
        )}
        <div className="flex justify-end gap-3 border-t border-ink/15 pt-4">
          <Button onClick={closeEditor}>
            {initialData ? "Close editor" : "Save draft & close"}
          </Button>
          {preview ? (
            <Button
              key="edit"
              onClick={() => setPreview(false)}
            >
              Return to editor
            </Button>
          ) : stage === "compose" ? (
            <Button
              onClick={() => setStage("details")}
              variant="primary"
            >
              Continue to post details →
            </Button>
          ) : (
            <Button
              key="save"
              type="submit"
              variant="primary"
            >
              {busy
                ? "Saving…"
                : form.published
                  ? "Save & publish"
                  : "Save draft"}
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  );
}
