import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createServer } from "vite";
import viteConfig from "../vite.config.ts";
import { apiConnectionMessage } from "../src/shared/apiConfig.ts";
import { apiFetch, apiResponseError, ApiRequestError } from "../src/shared/apiTransport.ts";

function developmentConfig(target) {
  const previousTarget = process.env.API_PROXY_TARGET;
  process.env.API_PROXY_TARGET = target;
  try {
    return viteConfig({ command: "serve", mode: "development" });
  } finally {
    if (previousTarget === undefined) delete process.env.API_PROXY_TARGET;
    else process.env.API_PROXY_TARGET = previousTarget;
  }
}

async function closeBackend(server) {
  if (!server.listening) {
    server.closeAllConnections();
    return;
  }
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
}

test("the Vite API proxy forwards requests, streams SSE, and explains backend outages", { timeout: 30_000 }, async (t) => {
  const defaultConfig = developmentConfig("");
  assert.equal(defaultConfig.server.host, "0.0.0.0");
  assert.equal(defaultConfig.server.port, 5173);
  assert.equal(defaultConfig.server.strictPort, true);
  assert.equal(defaultConfig.server.proxy["/api"].target, "http://127.0.0.1:5000");

  let streamResponse;
  let viteServer;
  // This server tests proxying only. Sharing the app's optimizer cache can
  // invalidate lazy-loaded dependencies while the real dev server is running.
  const cacheDir = await mkdtemp(path.join(tmpdir(), "dtro-vite-proxy-test-"));
  const backend = http.createServer(async (request, response) => {
    if (request.url === "/api/analytics/presence") {
      streamResponse = response;
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      response.flushHeaders();
      response.write('data: {"viewers":3}\n\n');
      return;
    }

    if (request.url === "/api/admin/projects") {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ code: "UNAUTHORIZED", message: "Admin access required." }));
      return;
    }

    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      path: request.url,
      origin: request.headers.origin,
      authorization: request.headers.authorization,
      contentType: request.headers["content-type"],
      body: Buffer.concat(chunks).toString(),
    }));
  });

  t.after(async () => {
    streamResponse?.destroy();
    await viteServer?.close();
    await closeBackend(backend);
    await rm(cacheDir, { recursive: true, force: true });
  });
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  const backendBase = `http://127.0.0.1:${backend.address().port}`;
  const config = developmentConfig(`${backendBase}/api`);
  assert.equal(config.server.proxy["/api"].target, backendBase);

  viteServer = await createServer({
    ...config,
    configFile: false,
    cacheDir,
    optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [],
    logLevel: "silent",
    server: { ...config.server, host: "127.0.0.1", port: 0 },
  });
  await viteServer.listen();
  const viteBase = `http://127.0.0.1:${viteServer.httpServer.address().port}`;
  const browserHeaders = {
    Origin: "http://192.168.1.42:5173",
    Authorization: "Bearer proxy-test-token",
  };

  const health = await apiFetch(`${viteBase}/api/health`, {
    headers: browserHeaders,
    signal: AbortSignal.timeout(5_000),
  });
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.path, "/api/health");
  assert.equal(healthBody.origin, browserHeaders.Origin);
  assert.equal(healthBody.authorization, browserHeaders.Authorization);

  const formData = new FormData();
  formData.append("image", new Blob(["image contents"], { type: "image/png" }), "cover.png");
  const uploadRequest = new Request(`${viteBase}/api/projects/upload`, {
    method: "POST",
    headers: browserHeaders,
    body: formData,
    signal: AbortSignal.timeout(5_000),
  });
  const multipartContentType = uploadRequest.headers.get("content-type");
  const uploaded = await apiFetch(uploadRequest);
  assert.equal(uploaded.status, 200);
  const uploadBody = await uploaded.json();
  assert.equal(uploadBody.path, "/api/projects/upload");
  assert.equal(uploadBody.origin, browserHeaders.Origin);
  assert.equal(uploadBody.authorization, browserHeaders.Authorization);
  assert.equal(uploadBody.contentType, multipartContentType);
  const boundary = multipartContentType.match(/^multipart\/form-data; boundary=(.+)$/)?.[1];
  assert.ok(boundary, "the browser supplies a multipart boundary");
  assert.ok(uploadBody.body.startsWith(`--${boundary}\r\n`));
  assert.match(uploadBody.body, /name="image"; filename="cover.png"/);
  assert.match(uploadBody.body, /image contents/);

  const unauthorized = await apiFetch(`${viteBase}/api/admin/projects`, {
    signal: AbortSignal.timeout(5_000),
  });
  assert.equal(unauthorized.status, 401);
  const unauthorizedError = await apiResponseError(unauthorized, "Could not load projects.");
  assert.ok(unauthorizedError instanceof ApiRequestError);
  assert.equal(unauthorizedError.kind, "http");
  assert.equal(unauthorizedError.status, 401);
  assert.equal(unauthorizedError.message, "Admin access required.");

  const presence = await apiFetch(`${viteBase}/api/analytics/presence`, {
    signal: AbortSignal.timeout(5_000),
  });
  assert.equal(presence.status, 200);
  assert.match(presence.headers.get("content-type"), /^text\/event-stream/);
  const reader = presence.body.getReader();
  try {
    const decoder = new TextDecoder();
    let frame = "";
    while (!frame.includes("\n\n")) {
      const { done, value } = await reader.read();
      assert.equal(done, false, "the first SSE frame arrives before the stream ends");
      frame += decoder.decode(value, { stream: true });
    }
    assert.equal(frame, 'data: {"viewers":3}\n\n');
    assert.equal(streamResponse.writableEnded, false);
    assert.equal(streamResponse.destroyed, false);
  } finally {
    await reader.cancel();
    streamResponse.destroy();
  }

  await closeBackend(backend);
  const unavailable = await apiFetch(`${viteBase}/api/health`, {
    signal: AbortSignal.timeout(5_000),
  });
  assert.equal(unavailable.status, 502);
  assert.match(unavailable.headers.get("content-type"), /^application\/json/);
  assert.deepEqual(await unavailable.clone().json(), {
    code: "API_UNREACHABLE",
    message: apiConnectionMessage,
  });
  const connectionError = await apiResponseError(unavailable, "Could not load health.");
  assert.ok(connectionError instanceof ApiRequestError);
  assert.equal(connectionError.kind, "network");
  assert.equal(connectionError.status, 502);
  assert.equal(connectionError.code, "API_UNREACHABLE");
  assert.equal(connectionError.message, apiConnectionMessage);
});
