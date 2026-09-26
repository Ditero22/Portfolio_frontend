import { getAccessToken } from "@/features/auth/services/authStorage";
import { API_URL } from "@/shared/api";
import { notifyPortfolioContentChanged } from "@/features/public/portfolioContent/services/portfolioContent.service";
import type {
  PortfolioContent,
  PortfolioContentInput,
  PortfolioContentKind,
} from "@/features/public/portfolioContent/types/portfolioContent";

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Could not save portfolio content.");
  }
  return response;
}

export async function getAdminContent(kind: PortfolioContentKind) {
  const response = await request(`/admin/${kind}`);
  return (await response.json()) as PortfolioContent[];
}

export async function saveAdminContent(
  kind: PortfolioContentKind,
  data: PortfolioContentInput,
  id?: string,
) {
  const response = await request(
    `/${kind}${id ? `/${encodeURIComponent(id)}` : ""}`,
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
  const response = await request(`/${kind}/${encodeURIComponent(content.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ published }),
  });
  const updated = (await response.json()) as PortfolioContent;
  notifyPortfolioContentChanged(kind);
  return updated;
}

export async function deleteAdminContent(
  kind: PortfolioContentKind,
  id: string,
) {
  await request(`/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });
  notifyPortfolioContentChanged(kind);
}

export async function reorderAdminContent(
  kind: PortfolioContentKind,
  ids: string[],
) {
  const response = await request(`/admin/${kind}/order`, {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
  const content = (await response.json()) as PortfolioContent[];
  notifyPortfolioContentChanged(kind);
  return content;
}
