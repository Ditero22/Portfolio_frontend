import { getAccessToken } from "@/features/auth/services/authStorage";
import { API_URL } from "@/shared/api";

export interface AdminAnalytics {
  visitors: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  content: {
    posts: number;
    publishedPosts: number;
    draftPosts: number;
    projects: number;
  };
  storage: {
    available: boolean;
    bytes: number | null;
    objects: number | null;
  };
  onlineViewers: number;
  retentionDays: number;
  generatedAt: string;
}

async function authorizedFetch(path: string, signal?: AbortSignal) {
  const response = await fetch(`${API_URL}${path}`, {
    signal,
    cache: "no-store",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Could not load admin analytics.");
  }
  return response;
}

export async function getAdminAnalytics(signal?: AbortSignal) {
  const response = await authorizedFetch("/admin/analytics", signal);
  return (await response.json()) as AdminAnalytics;
}
