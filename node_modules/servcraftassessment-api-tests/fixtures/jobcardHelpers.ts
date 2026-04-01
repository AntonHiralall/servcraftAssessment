import { expect, type APIResponse } from "@playwright/test";

/** Bonus: assert JSON APIs declare a JSON content type. */
export function expectJsonContentType(res: APIResponse): void {
  expect(res.headers()["content-type"] ?? "", "Content-Type should indicate JSON").toMatch(
    /application\/json/i
  );
}

export type JobCardJson = {
  id?: string;
  title?: string;
  customerName?: string;
  description?: string | null;
  customerEmail?: string | null;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  notes?: string | null;
  createdAt?: string;
  completedAt?: string | null;
};

export function jobCardsPath(id?: string): string {
  return id ? `/api/jobcards/${id}` : "/api/jobcards";
}

/** Accepts common paginated shapes or a bare array. */
export function extractJobCardItems(payload: unknown): JobCardJson[] {
  if (Array.isArray(payload)) return payload as JobCardJson[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    for (const key of ["items", "jobCards", "data", "results"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as JobCardJson[];
    }
  }
  return [];
}

export async function parseJson<T = unknown>(res: APIResponse): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
