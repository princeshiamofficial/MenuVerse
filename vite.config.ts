// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      host: true,
      allowedHosts: true,
      watch: {
        ignored: [
          "**/*cache*.json",
          "**/*-cache.json",
          "**/*-data-cache.json",
          "**/profile-data-cache.json",
          "**/branches-data-cache.json",
          "**/categories-data-cache.json",
          "**/items-data-cache.json",
          "**/orders-data-cache.json",
          "**/reservations-data-cache.json",
          "**/promotions-data-cache.json",
          "**/settings-data-cache.json",
          "**/tables-*-data-cache.json",
          "**/reservations-*-cache.json",
          "**/.system_generated/**",
        ],
      },
    },
  },
});
