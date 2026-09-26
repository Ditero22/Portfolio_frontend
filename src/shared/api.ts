const developmentApiUrl = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "";

export const API_URL = (
  import.meta.env.VITE_API_URL?.trim() || developmentApiUrl
).replace(/\/+$/, "");

export const publicApiRefreshIntervalMs = 60_000;
