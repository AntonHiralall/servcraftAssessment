import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

/** Local assessment UI per assessment.md; override with UI_BASE_URL in CI or other envs. */
const baseURL = process.env.UI_BASE_URL ?? "http://localhost:3001";
const configDir = path.dirname(fileURLToPath(import.meta.url));
/** Same folder as API tests so the repo-root report path is always valid after any suite run. */
const reportDir = path.join(configDir, "..", "playwright-report");

export default defineConfig({
  testDir: path.join(configDir, "tests"),
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never", outputFolder: reportDir }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});

