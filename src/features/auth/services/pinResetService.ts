import { API_URL, apiFetch, apiResponseError } from "@/shared/api";

export type PinResetChallenge = {
  nonce: string;
  expiresIn: number;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await apiResponseError(
      response,
      "The request could not be completed.",
    );
  }

  return response.json() as Promise<T>;
}

export async function requestPinResetChallenge() {
  const response = await apiFetch(`${API_URL}/auth/pin-reset/challenge`, {
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
  const response = await apiFetch(`${API_URL}/auth/pin-reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readResponse<{ message: string }>(response);
}
