import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

/** GitHub Pages serves unknown paths as 404.html — required for SPA refresh and deep links. */
function githubPagesSpaFallback(): Plugin {
  return {
    name: "github-pages-spa-fallback",
    closeBundle() {
      const indexHtml = join(process.cwd(), "dist", "index.html");
      if (!existsSync(indexHtml)) return;
      copyFileSync(indexHtml, join(process.cwd(), "dist", "404.html"));
    },
  };
}

export default defineConfig(async () => ({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react(), tailwindcss(), githubPagesSpaFallback()],

  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  optimizeDeps: {
    exclude: ["@tauri-apps/api"],
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
