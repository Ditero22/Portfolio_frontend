import { getAccessToken } from "@/features/auth/services/authStorage";
import { notifyHiringStatusChanged } from "@/features/public/availability/services/availability.service";
import { API_URL } from "@/shared/api";

export interface HiringStatus {
  isHired: boolean;
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
