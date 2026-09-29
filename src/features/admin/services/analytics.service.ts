import { getAccessToken } from "@/features/auth/services/authStorage";
import { API_URL, apiFetch, apiResponseError } from "@/shared/api";

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
    publishedProjects: number;
    hiddenProjects: number;
    experience: ContentVisibility;
    stack: ContentVisibility;
    skills: ContentVisibility;
    certifications: ContentVisibility;
    recommendations: ContentVisibility;
    resources: ContentVisibility;
  };
  settings: {
    isHired: boolean;
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

export interface ContentVisibility {
  total: number;
  published: number;
  hidden: number;
}

async function authorizedFetch(path: string, signal?: AbortSignal) {
  const response = await apiFetch(`${API_URL}${path}`, {
    signal,
    cache: "no-store",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!response.ok) {
    throw await apiResponseError(response, "Could not load admin analytics.");
  }
  return response;
}

export async function getAdminAnalytics(signal?: AbortSignal) {
  const response = await authorizedFetch("/admin/analytics", signal);
  return (await response.json()) as AdminAnalytics;
}
