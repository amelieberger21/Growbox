import { loadEnv } from "vite";
import { assistantPlugin } from "./server/assistant.ts";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), assistantPlugin({ ...loadEnv(mode, process.cwd(), ""), ...process.env } as Record<string, string>)],
  server: {
    watch: { usePolling: true, interval: 800, ignored: ["**/node_modules/**", "**/dist/**", "**/pnpm-store/**"] },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    restoreMocks: true,
  },
}));
