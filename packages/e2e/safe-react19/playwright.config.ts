import path from "node:path";

import { defineConfig } from "@playwright/test";

const port = Number(process.env.REACT19_SMOKE_PORT || 4179);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid local smoke port");
const baseURL = `http://127.0.0.1:${port}`;
// Reject accidental reuse of the fund-moving suite's remote environment.
if (process.env.BASE_URL && process.env.BASE_URL !== baseURL)
  throw new Error("Safe smoke is LOCAL-only; unset BASE_URL");
export default defineConfig({
  testDir: __dirname,
  testMatch: "components.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 45_000,
  reporter: "list",
  outputDir: path.resolve(__dirname, "../../../.yarn/react19-browser/results"),
  use: {
    baseURL,
    browserName: "chromium",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    {
      name: "mobile-reduced",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        reducedMotion: "reduce",
      },
    },
  ],
  webServer: {
    command: `node "${path.resolve(__dirname, "../../../node_modules/next/dist/bin/next")}" build "${path.resolve(__dirname, "fixture")}" && node "${path.resolve(__dirname, "serve.cjs")}"`,
    env: { NODE_ENV: "production" },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
