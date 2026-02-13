import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import rumious from "./packages/vite-plugin/dist/index.js";

export default defineConfig({
  plugins: [rumious()],
  test: {
    browser: {
      //   provider: playwright(),
      //   enabled: true,
      //   instances: [{ browser: "chromium" }],
    },
  },
});
