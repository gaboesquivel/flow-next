import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
    },
  },
  test: {
    environment: "node",
    exclude: [
      "node_modules/**",
      ".agents/**",
      ".claude/**",
      ".worktrees/**",
      ".next/**",
      ".eve/**",
      "mcp-app/**",
    ],
    include: ["**/*.test.ts"],
    // Files share workers instead of a fresh module graph each, which cuts collect time.
    // Env and global stubs reset after every test so no file leaks state into the next.
    isolate: false,
    // GitHub-hosted runners have 4 vCPUs; the default leaves one idle.
    maxWorkers: process.env.CI ? 4 : undefined,
    pool: "forks",
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
