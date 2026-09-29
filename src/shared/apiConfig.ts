interface ApiUrlOptions {
  production?: boolean;
}

export const apiConnectionMessage =
  "Could not connect to the portfolio API. Check your connection and try again.";

function apiPath(pathname: string) {
  const path = pathname
    .replace(/\/+/g, "/")
    .replace(/\/+$/, "")
    .replace(/(?:\/api)+$/, "");
  return `${path}/api`;
}

export function normalizeApiBaseUrl(
  value: string | undefined,
  { production = false }: ApiUrlOptions = {},
) {
  const input = value?.trim() ?? "";
  if (!input) {
    if (production) {
      throw new Error(
        "Set VITE_API_URL to the deployed backend API URL before building for production.",
      );
    }
    return "/api";
  }

  if (input.startsWith("/") && !input.startsWith("//")) {
    if (production) throw new Error("VITE_API_URL must use HTTPS in production.");
    const relative = new URL(input, "http://api.invalid");
    if (relative.search || relative.hash || /[?#]/.test(input)) {
      throw new Error("The API URL must not contain a query or fragment.");
    }
    return apiPath(relative.pathname);
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("The API URL must be an absolute HTTP or HTTPS URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("The API URL must use HTTP or HTTPS.");
  }
  if (
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    /[?#]/.test(input)
  ) {
    throw new Error(
      "The API URL must not contain credentials, a query, or a fragment.",
    );
  }
  if (production) {
    if (parsed.protocol !== "https:") {
      throw new Error("VITE_API_URL must use HTTPS in production.");
    }
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      /^127\./.test(hostname) ||
      hostname === "[::1]" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local")
    ) {
      throw new Error("VITE_API_URL must not point to a local host in production.");
    }
  }
  return `${parsed.origin}${apiPath(parsed.pathname)}`;
}

export function resolveApiProxyTarget(value: string | undefined) {
  const apiUrl = normalizeApiBaseUrl(value?.trim() || "http://127.0.0.1:5000");
  if (apiUrl.startsWith("/")) {
    throw new Error("API_PROXY_TARGET must be an absolute HTTP or HTTPS URL.");
  }
  // The browser supplies /api; the target supplies its origin and optional prefix.
  return apiUrl.slice(0, -"/api".length);
}

export function createApiSecurityHeaders(template: string, apiUrl: string) {
  const apiOrigin = new URL(
    normalizeApiBaseUrl(apiUrl, { production: true }),
  ).origin;
  if (!/connect-src\s+[^;\r\n]+;/.test(template)) {
    throw new Error(
      "The frontend security headers must contain a connect-src directive.",
    );
  }
  return template.replace(
    /connect-src\s+[^;\r\n]+;/,
    `connect-src 'self' ${apiOrigin} https://accounts.google.com;`,
  );
}
