import { test, expect } from "@playwright/test";

test("home page loads and shows a root element", async ({ page, baseURL }) => {
  // Arrange
  expect(baseURL, "baseURL missing (set UI_BASE_URL or rely on playwright.config default)").toBeTruthy();

  // Act
  await page.goto("/", { waitUntil: "networkidle" });

  // Assert
  await expect(page.locator("body")).toBeVisible();
});

