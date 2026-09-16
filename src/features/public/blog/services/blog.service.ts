import type { BlogPost } from "../types/blog";

const API_URL = "http://localhost:5000/api";

export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${API_URL}/blog`);

  if (!response.ok) {
    throw new Error("Failed to fetch blog posts.");
  }

  const posts = await response.json();

  return posts.map((post: BlogPost) => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    ),
  }));
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();

  return posts.find((post) => post.slug === slug);
}