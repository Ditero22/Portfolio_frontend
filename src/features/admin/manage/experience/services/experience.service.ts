import { API_URL, apiFetch, apiResponseError } from "@/shared/api";
import { getAccessToken } from "@/features/auth/services/authStorage";
import type {
  Experience,
  ExperienceInput,
} from "@/features/public/experience/types/experience";

async function request(path: string, options: RequestInit = {}) {
  const response = await apiFetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw await apiResponseError(
      response,
      "Could not update experience. Please try again.",
    );
  }
  return response;
}

export async function getAdminExperience(
  signal?: AbortSignal,
): Promise<Experience[]> {
  const response = await request("/admin/experience", { signal });
  return response.json();
}

export async function saveAdminExperience(
  data: ExperienceInput,
  id?: string,
): Promise<Experience> {
  const response = await request(
    `/experience${id ? `/${encodeURIComponent(id)}` : ""}`,
    {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(data),
    },
  );
  return response.json();
}

export async function updateExperienceVisibility(
  id: string,
  published: boolean,
): Promise<Experience> {
  const response = await request(`/experience/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ published }),
  });
  return response.json();
}

export async function deleteAdminExperience(id: string): Promise<void> {
  await request(`/experience/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function reorderExperience(ids: string[]): Promise<Experience[]> {
  const response = await request("/admin/experience/order", {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
  return response.json();
}
