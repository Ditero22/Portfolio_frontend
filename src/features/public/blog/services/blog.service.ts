import type { BlogPost } from "../types/blog";

import { API_URL } from "@/shared/api";

export async function getBlogPosts(signal?: AbortSignal): Promise<BlogPost[]> {
  const response = await fetch(`${API_URL}/blog`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blog posts.");
  }

  const posts = await response.json();

  return posts.map((post: BlogPost) => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));
}

export async function getBlogPostBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<BlogPost | undefined> {
  try {
    const response = await fetch(
      `${API_URL}/blog/slug/${encodeURIComponent(slug)}`,
      { signal, cache: "no-store" },
    );
    if (response.ok) return response.json();
  } catch {
    /* Fall back to the published list below. */
  }

  // Supports an older backend during deployment while keeping drafts private,
  // because the public list already contains published posts only.
  const posts = await getBlogPosts(signal);
  return posts.find((post) => post.slug === slug);
}
