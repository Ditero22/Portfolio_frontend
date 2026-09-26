import type { QRLoginResponse } from "../../../types/auth";

import { API_URL } from "@/shared/api";

export async function loginWithPin(pin: string): Promise<QRLoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
}
