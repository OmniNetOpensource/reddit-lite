import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup/setupTests.ts"],
    globals: true,
    css: true,
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
    },
  },
});
