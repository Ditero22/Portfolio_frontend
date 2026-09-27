import { getAccessToken } from "@/features/auth/services/authStorage";
import { API_URL } from "@/shared/api";

export async function uploadProjectImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const token = getAccessToken();
  const response = await fetch(`${API_URL}/projects/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(error?.message ?? "Failed to upload project image.");
  }

  const result = (await response.json()) as { imageUrl?: string };
  if (!result.imageUrl) {
    throw new Error("The image upload did not return a public URL.");
  }

  return result.imageUrl;
}
