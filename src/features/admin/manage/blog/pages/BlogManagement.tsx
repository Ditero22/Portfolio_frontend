import { useEffect, useRef, useState } from "react";

import { BlogForm, BlogTable, BlogViewModal } from "../components";

import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  getAdminBlogPosts,
  updateAdminBlogPost,
  uploadBlogImage,
} from "../services/blog.service";

import { Modal } from "@/shared/components/ui";
import { AdminContentSkeleton } from "@/shared/components/Loading";

import type { BlogPost, BlogPostForm } from "@/features/public/blog/types/blog";

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

function BlogManagement() {
  const [tab, setTab] = useState<"published" | "drafts">("published");
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletingRef = useRef(false);

  async function loadPosts() {
    try {
      setIsLoading(true);
      setLoadError(null);

      const data = await getAdminBlogPosts();

      setPosts(data);
    } catch {
      setLoadError("Could not load blog posts. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminBlogPosts()
      .then((data) => {
        if (active) {
          setPosts(data);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError("Could not load blog posts. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleView(post: BlogPost) {
    setSelectedPost(post);
    setIsViewOpen(true);
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    setError(null);
    setIsEditOpen(true);
  }

  async function handleDelete() {
    if (!deletingPost || deletingRef.current) return;
    deletingRef.current = true;
    setIsDeleting(true);
    try {
      setDeleteError(null);

      await deleteAdminBlogPost(deletingPost.id);
      setDeletingPost(null);

      await loadPosts();
    } catch (error) {
      console.error(error);

      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete blog post.",
      );
    } finally {
      deletingRef.current = false;
      setIsDeleting(false);
    }
  }

  async function handleCreate(form: BlogPostForm, imageFile: File | null) {
    try {
      setIsSubmitting(true);
      setError(null);

      let imageUrl = form.imageUrl;

      if (imageFile) {
        imageUrl = await uploadBlogImage(imageFile);
      }

      await createAdminBlogPost({
        ...form,
        imageUrl,
      });

      setIsCreateOpen(false);
      setTab(form.published ? "published" : "drafts");

      await loadPosts();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to create blog post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(form: BlogPostForm, imageFile: File | null) {
    if (!editingPost) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let imageUrl = form.imageUrl;

      if (imageFile) {
        imageUrl = await uploadBlogImage(imageFile);
      }

      await updateAdminBlogPost(editingPost.id, {
        ...form,
        imageUrl,
      });

      setIsEditOpen(false);
      setEditingPost(null);
      setTab(form.published ? "published" : "drafts");

      await loadPosts();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to update blog post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function getEditFormData(post: BlogPost): BlogPostForm {
    return {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      slug: post.slug,
      imageUrl: post.imageUrl,
      link: post.link,
      published: post.published,
    };
  }

  const editingFormData = editingPost
    ? getEditFormData(editingPost)
    : emptyForm;

  return (
    <div className="admin-outlet-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-4xl text-ink md:text-5xl"
            style={{
              fontFamily: "var(--font-display)",
            }}
          >
            Blog
          </h1>

          <p className="mt-2 text-sm text-ink/50">Manage your blog posts.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsCreateOpen(true);
          }}
          className="rounded-md bg-ink px-4 py-2 text-sm text-paper transition hover:bg-ink/80"
        >
          New Post
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Post status">
        {(["published", "drafts"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            disabled={isLoading}
            onClick={() => setTab(value)}
            className={`min-h-10 rounded-md border px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-wait disabled:opacity-60 ${tab === value ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/70 hover:bg-ink/5"}`}
          >
            {value === "published" ? "Published" : "Drafts"} (
            {
              isLoading
                ? "…"
                : posts.filter(
                    (post) => post.published === (value === "published"),
                  ).length
            }
            )
          </button>
        ))}
      </div>
      {/* Table */}
      <section className="mt-8">
        {isLoading ? (
          <AdminContentSkeleton
            label="blog posts"
            layout="responsive-table"
            rows={4}
            columns={6}
            tableMinWidth={780}
          />
        ) : loadError ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void loadPosts()}
              className="rounded-lg border border-red-500/25 px-3 py-2 font-medium text-red-700 transition hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              Try again
            </button>
          </div>
        ) : (
          <BlogTable
            posts={posts.filter(
              (post) => post.published === (tab === "published"),
            )}
            emptyMessage={`No ${tab === "published" ? "published posts" : "drafts"} yet.`}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(post) => {
              setDeleteError(null);
              setDeletingPost(post);
            }}
          />
        )}
      </section>

      {/* View Modal */}
      <Modal
        isOpen={deletingPost !== null}
        onClose={() => {
          if (!deletingRef.current) setDeletingPost(null);
        }}
        title="Delete Blog Post"
        size="sm"
      >
        <div
          className="space-y-5 text-ink"
          aria-busy={isDeleting}
        >
          <p>Delete “{deletingPost?.title}”? This cannot be undone.</p>
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
              disabled={isDeleting}
              onClick={() => setDeletingPost(null)}
              className="rounded-md border border-ink/20 px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              className="rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Delete post"}
            </button>
          </div>
        </div>
      </Modal>
      <BlogViewModal
        post={selectedPost}
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedPost(null);
        }}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsCreateOpen(false);
          }
        }}
        title="Create Blog Post"
        size="xl"
      >
        <BlogForm
          onSubmit={handleCreate}
          onCancel={() => {
            if (!isSubmitting) {
              setIsCreateOpen(false);
            }
          }}
          isSubmitting={isSubmitting}
          onBusyChange={setIsSubmitting}
          errorMessage={error}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsEditOpen(false);
            setEditingPost(null);
          }
        }}
        title="Edit Blog Post"
        size="xl"
      >
        {editingPost && (
          <BlogForm
            key={editingPost.id}
            initialData={editingFormData}
            onSubmit={handleUpdate}
            onCancel={() => {
              if (!isSubmitting) {
                setIsEditOpen(false);
                setEditingPost(null);
              }
            }}
            isSubmitting={isSubmitting}
            onBusyChange={setIsSubmitting}
            errorMessage={error}
          />
        )}
      </Modal>
    </div>
  );
}

export default BlogManagement;
