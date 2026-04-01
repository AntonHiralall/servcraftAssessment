import { test, expect } from "../fixtures/api.js";
import { jobCardsPath, uniqueSuffix } from "../fixtures/jobcardHelpers.js";

test.describe("Job cards negative and edge cases", () => {
  test("POST without required title returns client error", async ({ authedRequest }) => {
    const res = await authedRequest.post(jobCardsPath(), {
      data: { customerName: `NoTitle ${uniqueSuffix()}` },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("POST without required customerName returns client error", async ({
    authedRequest,
  }) => {
    const res = await authedRequest.post(jobCardsPath(), {
      data: { title: `NoCustomer ${uniqueSuffix()}` },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("GET by non-existent id returns client error", async ({ authedRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await authedRequest.get(jobCardsPath(fakeId));
    expect([400, 404], `expected 400 or 404, got ${res.status()
      }`).toContain(res.status());
  });

  test("PUT for non-existent id returns client error", async ({ authedRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await authedRequest.put(jobCardsPath(fakeId), {
      data: {
        title: "Ghost",
        customerName: "Nobody",
        status: "Open",
      },
    });
    expect([400, 404], `expected 400 or 404, got ${res.status()
      }`).toContain(res.status());
  });

  test("DELETE for non-existent id returns client error", async ({ authedRequest }) => {
    const fakeId = "00000000-0000-0000-0000-000000000001";
    const res = await authedRequest.delete(jobCardsPath(fakeId));
    expect([400, 404], `expected 400 or 404, got ${res.status()
      }`).toContain(res.status());
  });

  test("GET list accepts large pageSize without server error", async ({ authedRequest }) => {
    const res = await authedRequest.get(jobCardsPath(), {
      params: { page: "1", pageSize: "99999" },
    });

    expect(res.status()).toBeLessThan(500);
  });
});
