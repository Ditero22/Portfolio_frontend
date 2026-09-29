import { getAccessToken } from "@/features/auth/services/authStorage";
import { API_URL, apiFetch, apiResponseError } from "@/shared/api";
import { notifyPortfolioContentChanged } from "@/features/public/portfolioContent/services/portfolioContent.service";
import type {
  PortfolioContent,
  PortfolioContentInput,
  PortfolioContentKind,
} from "@/features/public/portfolioContent/types/portfolioContent";

async function request(
  path: string,
  kind: PortfolioContentKind,
  options: RequestInit = {},
) {
  const response = await apiFetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    if (kind === "resources" && response.status === 500) {
      throw await apiResponseError(
        response,
        "Resources are unavailable because the backend database migration has not been applied. Apply the pending Resources migration to the intended database, then restart the backend.",
        { useServerMessage: false },
      );
    }
    throw await apiResponseError(response, "Could not save portfolio content.");
  }
  return response;
}

export async function getAdminContent(kind: PortfolioContentKind) {
  const response = await request(`/admin/${kind}`, kind);
  return (await response.json()) as PortfolioContent[];
}

export async function uploadPortfolioContentImage(
  kind: PortfolioContentKind,
  file: File,
): Promise<string> {
  if (kind !== "certifications") {
    throw new Error("Image uploads are only enabled for certifications.");
  }

  const formData = new FormData();
  formData.append("image", file);
  const token = getAccessToken();
  const response = await apiFetch(`${API_URL}/${kind}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!response.ok) {
    throw await apiResponseError(
      response,
      "Could not upload certification image.",
    );
  }

  const result = (await response.json()) as { imageUrl?: string };
  if (!result.imageUrl) {
    throw new Error("The image upload did not return a public URL.");
  }
  return result.imageUrl;
}

export async function saveAdminContent(
  kind: PortfolioContentKind,
  data: PortfolioContentInput,
  id?: string,
) {
  const response = await request(
    `/${kind}${id ? `/${encodeURIComponent(id)}` : ""}`,
    kind,
    {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(data),
    },
  );
  const content = (await response.json()) as PortfolioContent;
  notifyPortfolioContentChanged(kind);
  return content;
}

export async function updateContentVisibility(
  kind: PortfolioContentKind,
  content: PortfolioContent,
  published: boolean,
) {
  const response = await request(
    `/${kind}/${encodeURIComponent(content.id)}`,
    kind,
    {
      method: "PATCH",
      body: JSON.stringify({ published }),
    },
  );
  const updated = (await response.json()) as PortfolioContent;
  notifyPortfolioContentChanged(kind);
  return updated;
}

export async function deleteAdminContent(
  kind: PortfolioContentKind,
  id: string,
) {
  await request(`/${kind}/${encodeURIComponent(id)}`, kind, {
    method: "DELETE",
  });
  notifyPortfolioContentChanged(kind);
}

export async function reorderAdminContent(
  kind: PortfolioContentKind,
  ids: string[],
) {
  const response = await request(
    `/admin/${kind}/order`,
    kind,
    {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    },
  );
  const content = (await response.json()) as PortfolioContent[];
  notifyPortfolioContentChanged(kind);
  return content;
}
