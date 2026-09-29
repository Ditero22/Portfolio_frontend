import type { QRLoginResponse } from "../../../types/auth";

import { API_URL, apiFetch, apiResponseError } from "@/shared/api";

export async function loginWithPin(pin: string): Promise<QRLoginResponse> {
  const response = await apiFetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin }),
  });

  if (!response.ok) {
    throw await apiResponseError(response, "Login failed.");
  }

  return response.json();
}
