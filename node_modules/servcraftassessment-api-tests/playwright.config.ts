import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const baseURL = process.env.API_BASE_URL ?? "http://localhost:5000";
const configDir = path.dirname(fileURLToPath(import.meta.url));
/** Stable location for `npx playwright show-report` / IDE report (not cwd-dependent). */
const reportDir = path.join(configDir, "..", "playwright-report");

export default defineConfig({
  // Only this package's specs, regardless of cwd (avoids accidentally picking up ui-tests).
  testDir: path.join(configDir, "tests"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: reportDir }],
  ],
  timeout: 30_000,
  use: {
    baseURL,
    // Do not set X-Api-Key globally — auth specs need unauthenticated contexts.
  },
});
