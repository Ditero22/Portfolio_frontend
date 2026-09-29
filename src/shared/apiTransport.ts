import { apiConnectionMessage } from "./apiConfig.ts";

export type ApiErrorKind = "network" | "http";

export class ApiRequestError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly code: string | undefined;

  constructor(
    message: string,
    kind: ApiErrorKind,
    status?: number,
    code?: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "ApiRequestError";
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch(
  input: string | Request | URL,
  options?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, options);
  } catch (error) {
    if (
      options?.signal?.aborted ||
      (input instanceof Request && input.signal.aborted) ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw error;
    }
    throw new ApiRequestError(
      apiConnectionMessage,
      "network",
      undefined,
      undefined,
      error,
    );
  }
}

export async function apiResponseError(
  response: Response,
  fallbackMessage: string,
  { useServerMessage = true }: { useServerMessage?: boolean } = {},
) {
  const body: unknown = await response.json().catch(() => null);
  const data = typeof body === "object" && body !== null ? body : {};
  const code =
    "code" in data && typeof data.code === "string" ? data.code : undefined;
  const message =
    useServerMessage &&
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim()
      ? data.message
      : fallbackMessage;
  return new ApiRequestError(
    code === "API_UNREACHABLE" ? apiConnectionMessage : message,
    code === "API_UNREACHABLE" ? "network" : "http",
    response.status,
    code,
  );
}
