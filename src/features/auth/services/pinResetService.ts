import { API_URL } from "@/shared/api";

type ApiMessage = {
  code?: string;
  message?: string;
};

export type PinResetChallenge = {
  nonce: string;
  expiresIn: number;
};

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & ApiMessage;

  if (!response.ok) {
    throw new Error(body.message || "The request could not be completed.");
  }

  return body;
}

export async function requestPinResetChallenge() {
  const response = await fetch(`${API_URL}/auth/pin-reset/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  return readResponse<PinResetChallenge>(response);
}

export async function resetPinWithGoogle(input: {
  credential: string;
  newPin: string;
  nonce: string;
}) {
  const response = await fetch(`${API_URL}/auth/pin-reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readResponse<{ message: string }>(response);
}
