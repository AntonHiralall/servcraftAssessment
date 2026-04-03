import { test, expect, createUnauthenticatedRequest, createInvalidKeyRequest } from "../fixtures/api.js";
import { jobCardsPath } from "../fixtures/jobcardHelpers.js";

test.describe("API authentication", () => {
  test("rejects list request when X-Api-Key is missing", async ({ playwright }) => {
    const ctx = await createUnauthenticatedRequest(playwright);
    try {
      const res = await ctx.get(jobCardsPath());
      expect([401, 403], `expected 401 or 403, got ${res.status()}`).toContain(
        res.status()
      );
    } finally {
      await ctx.dispose();
    }
  });

  test("rejects list request when X-Api-Key is invalid", async ({ playwright }) => {
    const ctx = await createInvalidKeyRequest(playwright);
    try {
      const res = await ctx.get(jobCardsPath());
      expect([401, 403], `expected 401 or 403, got ${res.status()}`).toContain(
        res.status()
      );
    } finally {
      await ctx.dispose();
    }
  });
});
