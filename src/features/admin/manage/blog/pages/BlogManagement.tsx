import { useEffect, useState } from "react";

import {
    BlogForm,
    BlogTable,
    BlogViewModal,
} from "../components";

import {
    createAdminBlogPost, deleteAdminBlogPost,
    getAdminBlogPosts,
    updateAdminBlogPost,
    uploadBlogImage,
} from "../services/blog.service";


import { Modal } from "@/shared/components/ui";

import type {
    BlogPost,
    BlogPostForm,
} from "@/features/public/blog/types/blog";

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
    const [posts, setPosts] = useState<BlogPost[]>([]);

    const [selectedPost, setSelectedPost] =
        useState<BlogPost | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);

    const [isCreateOpen, setIsCreateOpen] =
        useState(false);

    const [isEditOpen, setIsEditOpen] =
        useState(false);

    const [editingPost, setEditingPost] =
        useState<BlogPost | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] = useState<string | null>(
        null,
    );

    async function loadPosts() {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getAdminBlogPosts();

            setPosts(data);
        } catch (error) {
            console.error(error);

            setError("Failed to load blog posts.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadPosts();
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

    async function handleDelete(post: BlogPost) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${post.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setError(null);

            await deleteAdminBlogPost(post.id);

            await loadPosts();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete blog post.",
            );
        }
    }

    async function handleCreate(
        form: BlogPostForm,
        imageFile: File | null,
    ) {
        try {
            setIsSubmitting(true);
            setError(null);

            let imageUrl = form.imageUrl;

            if (imageFile) {
                imageUrl = await uploadBlogImage(
                    imageFile,
                );
            }

            await createAdminBlogPost({
                ...form,
                imageUrl,
            });

            setIsCreateOpen(false);

            await loadPosts();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create blog post.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleUpdate(
        form: BlogPostForm,
        imageFile: File | null,
    ) {
        if (!editingPost) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            let imageUrl = form.imageUrl;

            if (imageFile) {
                imageUrl = await uploadBlogImage(
                    imageFile,
                );
            }

            await updateAdminBlogPost(
                editingPost.id,
                {
                    ...form,
                    imageUrl,
                },
            );

            setIsEditOpen(false);
            setEditingPost(null);

            await loadPosts();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update blog post.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function getEditFormData(
        post: BlogPost,
    ): BlogPostForm {
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
        <main className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="text-4xl text-white md:text-5xl"
                        style={{
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        Blog
                    </h1>

                    <p className="mt-2 text-sm text-white/50">
                        Manage your blog posts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setError(null);
                        setIsCreateOpen(true);
                    }}
                    className="rounded-md bg-white px-4 py-2 text-sm text-black transition hover:bg-white/80"
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

            {/* Table */}
            <section className="mt-8">
                {isLoading ? (
                    <div className="text-sm text-white/40">
                        Loading posts...
                    </div>
                ) : (
                    <BlogTable
                        posts={posts}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </section>

            {/* View Modal */}
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
                    />
                )}
            </Modal>
        </main>
    );
}

export default BlogManagement;