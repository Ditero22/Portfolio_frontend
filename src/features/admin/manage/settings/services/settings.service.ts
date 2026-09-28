import { getAccessToken } from "@/features/auth/services/authStorage";
import { notifyHiringStatusChanged } from "@/features/public/availability/services/availability.service";
import { API_URL } from "@/shared/api";
import { notifyResumeChanged } from "@/features/public/resume/services/resume.service";
import type { ResumeVersion } from "@/features/public/resume/types/resume";

export interface HiringStatus {
  isHired: boolean;
}

async function getResumeError(response: Response) {
  const error = await response.json().catch(() => null);
  return error?.message ?? "Could not update resume settings.";
}

export async function getAdminHiringStatus(signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/settings/hiring`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load availability settings.");
  return (await response.json()) as HiringStatus;
}

export async function saveAdminHiringStatus(isHired: boolean) {
  const response = await fetch(`${API_URL}/admin/settings/hiring`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isHired }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Could not update availability.");
  }
  const status = (await response.json()) as HiringStatus;
  notifyHiringStatusChanged();
  return status;
}

export async function getAdminResumeVersions(signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/admin/resumes`, {
    signal,
    cache: "no-store",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!response.ok) throw new Error(await getResumeError(response));
  return (await response.json()) as ResumeVersion[];
}

export async function uploadAdminResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);
  const response = await fetch(`${API_URL}/admin/resumes/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });
  if (!response.ok) throw new Error(await getResumeError(response));
  const version = (await response.json()) as ResumeVersion;
  notifyResumeChanged();
  return version;
}

export async function activateAdminResume(id: string) {
  const response = await fetch(
    `${API_URL}/admin/resumes/${encodeURIComponent(id)}/activate`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    },
  );
  if (!response.ok) throw new Error(await getResumeError(response));
  const version = (await response.json()) as ResumeVersion;
  notifyResumeChanged();
  return version;
}

export async function downloadAdminResumeVersion(id: string) {
  const response = await fetch(
    `${API_URL}/admin/resumes/${encodeURIComponent(id)}/download`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    },
  );
  if (!response.ok) throw new Error(await getResumeError(response));
  return response.blob();
}
