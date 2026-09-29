import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  apiConnectionMessage,
  createApiSecurityHeaders,
  normalizeApiBaseUrl,
  resolveApiProxyTarget,
} from "../src/shared/apiConfig.ts";
import { apiFetch, apiResponseError, ApiRequestError } from "../src/shared/apiTransport.ts";

async function listen(server, t) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

test("API bases supply one /api prefix for desktop, LAN, and deployed requests", () => {
  assert.equal(normalizeApiBaseUrl(undefined), "/api");
  assert.equal(normalizeApiBaseUrl(" /api/api/// "), "/api");
  assert.equal(normalizeApiBaseUrl("https://api.example.com"), "https://api.example.com/api");
  assert.equal(normalizeApiBaseUrl("https://api.example.com/api/api/"), "https://api.example.com/api");
  assert.equal(normalizeApiBaseUrl("https://api.example.com/service/api/"), "https://api.example.com/service/api");
  assert.equal(resolveApiProxyTarget(undefined), "http://127.0.0.1:5000");
  assert.equal(resolveApiProxyTarget("http://192.168.1.5:5000/api/"), "http://192.168.1.5:5000");
  assert.equal(resolveApiProxyTarget("https://api.example.com/service"), "https://api.example.com/service");
  assert.throws(() => resolveApiProxyTarget("/api"), /absolute/);
});

test("production API configuration rejects unreachable or unsafe URL forms", () => {
  for (const value of [undefined, "/api", "http://api.example.com", "https://localhost", "https://127.0.0.2", "https://[::1]", "https://app.local"]) {
    assert.throws(() => normalizeApiBaseUrl(value, { production: true }));
  }
  for (const value of ["https://user:pass@api.example.com", "https://api.example.com/api?", "https://api.example.com/api?token=public", "https://api.example.com/api#", "//api.example.com", "ftp://api.example.com"]) {
    assert.throws(() => normalizeApiBaseUrl(value));
  }
  assert.equal(normalizeApiBaseUrl("https://api.example.com/", { production: true }), "https://api.example.com/api");
});

test("built CSP follows the API origin and keeps the other security directives", async () => {
  const template = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  const built = createApiSecurityHeaders(template, "https://new-api.example.com/service/api");
  assert.match(built, /connect-src 'self' https:\/\/new-api\.example\.com https:\/\/accounts\.google\.com;/);
  assert.doesNotMatch(built, /connect-src[^;]*portfolio-backend-7337/);
  assert.equal(
    built.replace(/connect-src[^;]+;/, "connect-src TEST;"),
    template.replace(/connect-src[^;]+;/, "connect-src TEST;"),
  );
  assert.throws(() => createApiSecurityHeaders("/*\n  X-Frame-Options: DENY", "https://api.example.com"), /connect-src/);
});

test("transport keeps HTTP failures distinct from an unreachable backend", async (t) => {
  const server = http.createServer((request, response) => {
    if (request.url === "/api/forbidden") {
      response.writeHead(403, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ code: "FORBIDDEN", message: "Admin access required." }));
    } else if (request.url === "/api/missing") {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ code: "NOT_FOUND", message: "Article not found." }));
    } else if (request.url === "/api/unreachable") {
      response.writeHead(502, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ code: "API_UNREACHABLE", message: apiConnectionMessage }));
    } else {
      response.writeHead(500, { "Content-Type": "text/html" });
      response.end("<h1>Unavailable</h1>");
    }
  });
  const base = await listen(server, t);
  const forbidden = await apiFetch(`${base}/api/forbidden`);
  assert.equal(forbidden.status, 403);
  const error = await apiResponseError(forbidden, "Request failed.");
  assert.ok(error instanceof ApiRequestError);
  assert.equal(error.kind, "http");
  assert.equal(error.status, 403);
  assert.equal(error.code, "FORBIDDEN");
  assert.equal(error.message, "Admin access required.");

  const missing = await apiFetch(`${base}/api/missing`);
  assert.equal(missing.status, 404);
  const missingError = await apiResponseError(missing, "Could not load article.");
  assert.ok(missingError instanceof ApiRequestError);
  assert.equal(missingError.kind, "http");
  assert.equal(missingError.status, 404);
  assert.equal(missingError.code, "NOT_FOUND");
  assert.equal(missingError.message, "Article not found.");

  const unavailable = await apiResponseError(await apiFetch(`${base}/api/unreachable`), "Request failed.");
  assert.equal(unavailable.kind, "network");
  assert.equal(unavailable.status, 502);
  assert.equal(unavailable.message, apiConnectionMessage);

  const invalidBody = await apiResponseError(await apiFetch(`${base}/api/error`), "Could not load this section.");
  assert.equal(invalidBody.kind, "http");
  assert.equal(invalidBody.status, 500);
  assert.equal(invalidBody.message, "Could not load this section.");

  await new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  });
  await assert.rejects(apiFetch(`${base}/api/health`), (failure) => {
    assert.ok(failure instanceof ApiRequestError);
    assert.equal(failure.kind, "network");
    assert.equal(failure.status, undefined);
    assert.equal(failure.message, apiConnectionMessage);
    return true;
  });
});

test("uploads retain authorization and browser-generated multipart boundaries", async (t) => {
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      path: request.url,
      authorization: request.headers.authorization,
      contentType: request.headers["content-type"],
      body: Buffer.concat(chunks).toString(),
    }));
  });
  const base = await listen(server, t);
  const formData = new FormData();
  formData.append("image", new Blob(["image contents"], { type: "image/png" }), "cover.png");
  const headers = { Authorization: "Bearer test-token" };
  const uploaded = await apiFetch(`${base}/api/projects/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  const result = await uploaded.json();
  assert.equal(result.path, "/api/projects/upload");
  assert.equal(result.authorization, "Bearer test-token");
  assert.match(result.contentType, /^multipart\/form-data; boundary=/);
  assert.match(result.body, /name="image"; filename="cover.png"/);
  assert.match(result.body, /image contents/);
  assert.deepEqual(headers, { Authorization: "Bearer test-token" });
});

test("intentional request cancellation is preserved without a network error", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(apiFetch("http://127.0.0.1:1/api/health", { signal: controller.signal }), { name: "AbortError" });
});
