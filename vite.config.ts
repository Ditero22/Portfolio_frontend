import path from "node:path";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (mode === "production") {
    const apiUrl = env.VITE_API_URL?.trim();
    if (!apiUrl) {
      throw new Error(
        "Set VITE_API_URL to the deployed backend API URL before building for production.",
      );
    }

    const parsedApiUrl = new URL(apiUrl);
    if (parsedApiUrl.protocol !== "https:") {
      throw new Error("VITE_API_URL must use HTTPS in production.");
    }

    const hostname = parsedApiUrl.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local")
    ) {
      throw new Error("VITE_API_URL must not point to a local host in production.");
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
