import { normalizeApiBaseUrl } from "./apiConfig";

export { apiFetch, apiResponseError, ApiRequestError } from "./apiTransport";

export const API_URL = import.meta.env.DEV
  ? "/api"
  : normalizeApiBaseUrl(import.meta.env.VITE_API_URL, { production: true });

export const publicApiRefreshIntervalMs = 60_000;
