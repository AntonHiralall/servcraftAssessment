import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

/**
 * Repo-root config so `npx playwright test` from this directory picks up explicit
 * projects and correct base URLs. Package-level configs remain for `npm run test:api` / `test:ui`.
 * Uses .mts because the root package is not `"type": "module"` (avoids CJS/ESM transform issues).
 */
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const reportDir = path.join(rootDir, "playwright-report");

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: reportDir }],
  ],
  projects: [
    {
      name: "api",
      testDir: path.join(rootDir, "api-tests", "tests"),
      fullyParallel: true,
      use: {
        baseURL: process.env.API_BASE_URL ?? "http://localhost:5000",
      },
    },
    {
      name: "chromium",
      testDir: path.join(rootDir, "ui-tests", "tests"),
      use: {
        baseURL: process.env.UI_BASE_URL ?? "http://localhost:3001",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
