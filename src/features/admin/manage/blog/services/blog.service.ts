import { notifyBlogChanged } from "@/features/public/blog/services/blogUpdates";
import type { BlogPost, BlogPostForm } from "@/features/public/blog/types/blog";

import { getAccessToken } from "@/features/auth/services/authStorage";

import { API_URL, apiFetch, apiResponseError } from "@/shared/api";

function getAuthHeaders(): HeadersInit {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  const response = await apiFetch(`${API_URL}/admin/blog`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Failed to fetch blog posts.");
  }

  return response.json();
}

export async function getAdminBlogPost(id: string): Promise<BlogPost> {
  const response = await apiFetch(`${API_URL}/admin/blog/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Failed to fetch blog post.");
  }

  return response.json();
}

export async function uploadBlogImage(file: File): Promise<string> {
  const formData = new FormData();

  formData.append("image", file);

  const response = await apiFetch(`${API_URL}/blog/upload`, {
    method: "POST",

    headers: {
      ...getAuthHeaders(),
    },

    body: formData,
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Failed to upload image.");
  }

  const data = await response.json();

  return data.imageUrl;
}

export async function createAdminBlogPost(
  data: BlogPostForm,
): Promise<BlogPost> {
  const response = await apiFetch(`${API_URL}/blog`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Failed to create blog post.");
  }

  const post: BlogPost = await response.json();
  notifyBlogChanged();
  return post;
}

export async function updateAdminBlogPost(
  id: string,
  data: BlogPostForm,
): Promise<BlogPost> {
  const response = await apiFetch(`${API_URL}/blog/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Failed to update blog post.");
  }

  const post: BlogPost = await response.json();
  notifyBlogChanged();
  return post;
}

export async function deleteAdminBlogPost(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/blog/${id}`, {
    method: "DELETE",

    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Failed to delete blog post.");
  }
  notifyBlogChanged();
}
