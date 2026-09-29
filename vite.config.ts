import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  apiConnectionMessage,
  createApiSecurityHeaders,
  normalizeApiBaseUrl,
  resolveApiProxyTarget,
} from "./src/shared/apiConfig.ts";

function apiSecurityHeaders(apiUrl: string): Plugin {
  let config: ResolvedConfig;
  return {
    name: "portfolio-api-security-headers",
    apply: "build",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    writeBundle() {
      const template = readFileSync(
        path.resolve(config.publicDir, "_headers"),
        "utf8",
      );
      writeFileSync(
        path.resolve(config.root, config.build.outDir, "_headers"),
        createApiSecurityHeaders(template, apiUrl),
      );
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_", "API_PROXY_"]);
  const apiUrl =
    command === "build"
      ? normalizeApiBaseUrl(env.VITE_API_URL, { production: true })
      : "/api";
  const proxyTarget = resolveApiProxyTarget(env.API_PROXY_TARGET);

  return {
    plugins: [react(), tailwindcss(), apiSecurityHeaders(apiUrl)],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          configure(proxy) {
            proxy.on("error", (_error, _request, response) => {
              if (!("writeHead" in response) || response.headersSent) return;
              response.writeHead(502, { "Content-Type": "application/json" });
              response.end(
                JSON.stringify({
                  code: "API_UNREACHABLE",
                  message: apiConnectionMessage,
                }),
              );
            });
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
