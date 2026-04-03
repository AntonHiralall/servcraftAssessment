import { test as base, type APIRequestContext } from "@playwright/test";

export const API_KEY = process.env.API_KEY ?? "servcraft-test-key-2025";

export function apiBaseURL(): string {
  return process.env.API_BASE_URL ?? "http://localhost:5000";
}

export async function createAuthenticatedRequest(
  playwright: typeof import("@playwright/test").playwright
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: apiBaseURL(),
    extraHTTPHeaders: { "X-Api-Key": API_KEY },
  });
}

export async function createUnauthenticatedRequest(
  playwright: typeof import("@playwright/test").playwright
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: apiBaseURL(),
  });
}

export async function createInvalidKeyRequest(
  playwright: typeof import("@playwright/test").playwright
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: apiBaseURL(),
    extraHTTPHeaders: { "X-Api-Key": "invalid-key-not-real" },
  });
}

type Fixtures = {
  authedRequest: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  authedRequest: async ({ playwright }, use) => {
    const ctx = await createAuthenticatedRequest(playwright);
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from "@playwright/test";
