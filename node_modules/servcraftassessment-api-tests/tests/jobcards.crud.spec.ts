import { test, expect } from "../fixtures/api.js";
import {
  jobCardsPath,
  parseJson,
  extractJobCardItems,
  uniqueSuffix,
  expectJsonContentType,
  type JobCardJson,
} from "../fixtures/jobcardHelpers.js";

/** POST persists these values on this API; status on create defaults to Open, so we parameterize priority. */
const JOB_CARD_PRIORITIES = ["Low", "Medium", "High"] as const;

test.describe("Job cards CRUD", () => {
  test("POST creates a job card with minimal body and returns persisted fields", async ({
    authedRequest,
  }) => {
    // Arrange
    const suffix = uniqueSuffix();
    const title = `API Test ${suffix}`;
    const customerName = `Customer ${suffix}`;

    // Act
    const res = await authedRequest.post(jobCardsPath(), {
      data: { title, customerName },
    });

    // Assert
    expect(res.ok()).toBeTruthy();
    expect([200, 201], `unexpected create status ${res.status()}`).toContain(res.status());
    expectJsonContentType(res);

    const body = await parseJson<JobCardJson>(res);
    expect(body.id, "created job card should include id").toBeTruthy();
    expect(body.title).toBe(title);
    expect(body.customerName).toBe(customerName);

    await authedRequest.delete(jobCardsPath(body.id));
  });

  test("GET list returns job cards collection and honors pageSize=1", async ({ authedRequest }) => {
    // Arrange / Act — default list
    const res = await authedRequest.get(jobCardsPath(), {
      params: { page: "1", pageSize: "10" },
    });

    // Assert
    expect(res.ok()).toBeTruthy();
    expectJsonContentType(res);
    const payload = await parseJson<unknown>(res);
    const items = extractJobCardItems(payload);
    expect(Array.isArray(items)).toBeTruthy();

    // Pagination: at most one row when pageSize is 1
    const resOne = await authedRequest.get(jobCardsPath(), {
      params: { page: "1", pageSize: "1" },
    });
    expect(resOne.ok()).toBeTruthy();
    expectJsonContentType(resOne);
    const itemsOne = extractJobCardItems(await parseJson<unknown>(resOne));
    expect(itemsOne.length).toBeLessThanOrEqual(1);
  });

  for (const priority of JOB_CARD_PRIORITIES) {
    test(`POST creates job card with priority ${priority}`, async ({ authedRequest }) => {
      const suffix = uniqueSuffix();
      const res = await authedRequest.post(jobCardsPath(), {
        data: {
          title: `Priority ${priority} ${suffix}`,
          customerName: `Cust ${suffix}`,
          priority,
        },
      });
      expect(res.ok()).toBeTruthy();
      expect([200, 201]).toContain(res.status());
      expectJsonContentType(res);
      const body = await parseJson<JobCardJson>(res);
      expect(body.id).toBeTruthy();
      expect(body.priority).toBe(priority);
      await authedRequest.delete(jobCardsPath(body.id));
    });
  }

  test("GET by id returns the created job card", async ({ authedRequest }) => {
    const suffix = uniqueSuffix();
    // Arrange
    const createRes = await authedRequest.post(jobCardsPath(), {
      data: {
        title: `Read Test ${suffix}`,
        customerName: `Read Customer ${suffix}`,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    expectJsonContentType(createRes);
    const created = await parseJson<JobCardJson>(createRes);
    const id = created.id;
    expect(id).toBeTruthy();

    // Act
    const getRes = await authedRequest.get(jobCardsPath(id));

    // Assert
    expect(getRes.ok()).toBeTruthy();
    expectJsonContentType(getRes);
    const fetched = await parseJson<JobCardJson>(getRes);
    expect(fetched.id).toBe(id);
    expect(fetched.title).toBe(created.title);

    await authedRequest.delete(jobCardsPath(id));
  });

  test("PUT updates a job card and GET reflects changes", async ({ authedRequest }) => {
    const suffix = uniqueSuffix();
    const createRes = await authedRequest.post(jobCardsPath(), {
      data: {
        title: `Update Before ${suffix}`,
        customerName: `Update Customer ${suffix}`,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await parseJson<JobCardJson>(createRes);
    const id = created.id!;
    const newTitle = `Update After ${suffix}`;

    const putRes = await authedRequest.put(jobCardsPath(id), {
      data: {
        title: newTitle,
        customerName: created.customerName,
        status: "InProgress",
      },
    });
    expect(putRes.ok()).toBeTruthy();
    expectJsonContentType(putRes);

    const getRes = await authedRequest.get(jobCardsPath(id));
    expect(getRes.ok()).toBeTruthy();
    expectJsonContentType(getRes);
    const updated = await parseJson<JobCardJson>(getRes);
    expect(updated.title).toBe(newTitle);
    expect(updated.status).toBe("InProgress");

    await authedRequest.delete(jobCardsPath(id));
  });

  test("DELETE removes a job card; subsequent GET has no body", async ({ authedRequest }) => {
    const suffix = uniqueSuffix();
    const createRes = await authedRequest.post(jobCardsPath(), {
      data: {
        title: `Delete Test ${suffix}`,
        customerName: `Delete Customer ${suffix}`,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await parseJson<JobCardJson>(createRes);
    const id = created.id!;

    const delRes = await authedRequest.delete(jobCardsPath(id));
    expect(delRes.ok()).toBeTruthy();

    // This API returns 200 with an empty body after delete (not 404).
    const getRes = await authedRequest.get(jobCardsPath(id));
    expect(getRes.status()).toBe(200);
    const raw = (await getRes.text()).trim();
    expect(raw.length === 0 || raw === "null" || raw === "{}").toBeTruthy();
  });
});
