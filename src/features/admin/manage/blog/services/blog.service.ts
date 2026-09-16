import type {
  BlogPost,
  BlogPostForm,
} from "@/features/public/blog/types/blog";

import { getAccessToken } from "@/features/auth/services/authStorage";

const API_URL = "http://localhost:5000/api";

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
  const response = await fetch(`${API_URL}/blog`);

  if (!response.ok) {
    throw new Error("Failed to fetch blog posts.");
  }

  return response.json();
}

export async function getAdminBlogPost(
  id: string,
): Promise<BlogPost> {
  const response = await fetch(
    `${API_URL}/blog/${id}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch blog post.");
  }

  return response.json();
}

export async function uploadBlogImage(
  file: File,
): Promise<string> {
  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch(
    `${API_URL}/blog/upload`,
    {
      method: "POST",

      headers: {
        ...getAuthHeaders(),
      },

      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    throw new Error(
      error?.message ??
        "Failed to upload image.",
    );
  }

  const data = await response.json();

  return data.imageUrl;
}

export async function createAdminBlogPost(
  data: BlogPostForm,
): Promise<BlogPost> {
  const response = await fetch(
    `${API_URL}/blog`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },

      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    throw new Error(
      error?.message ??
        "Failed to create blog post.",
    );
  }

  return response.json();
}

export async function updateAdminBlogPost(
  id: string,
  data: BlogPostForm,
): Promise<BlogPost> {
  const response = await fetch(
    `${API_URL}/blog/${id}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },

      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    throw new Error(
      error?.message ??
        "Failed to update blog post.",
    );
  }

  return response.json();
}

export async function deleteAdminBlogPost(
  id: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/blog/${id}`,
    {
      method: "DELETE",

      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    throw new Error(
      error?.message ??
        "Failed to delete blog post.",
    );
  }
}