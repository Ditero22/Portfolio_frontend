import type { BlogPost, BlogPostSummary } from "../types/blog";

import { API_URL, apiFetch, apiResponseError } from "@/shared/api";

export async function getBlogPosts(
  signal?: AbortSignal,
): Promise<BlogPostSummary[]> {
  const response = await apiFetch(`${API_URL}/blog`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Failed to fetch blog posts.");
  }

  return response.json();
}

async function getBlogPostById(
  id: string,
  signal?: AbortSignal,
): Promise<BlogPost | undefined> {
  try {
    const response = await apiFetch(`${API_URL}/blog/${encodeURIComponent(id)}`, {
      signal,
      cache: "no-store",
    });
    if (response.ok) return response.json();
  } catch {
    // Treat an unavailable legacy endpoint as a missing article.
  }
  return undefined;
}

export async function getBlogPostBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<BlogPost | undefined> {
  try {
    const response = await apiFetch(
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
  const summary = posts.find((post) => post.slug === slug);
  if (!summary) return undefined;
  if (typeof summary.content === "string") return summary as BlogPost;
  return getBlogPostById(summary.id, signal);
}
