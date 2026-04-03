import type { JobCardCreateInput, JobCardEditInput, JobCardScenario } from "./job-card-ui.types.js";

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function baseCreate(overrides: Partial<JobCardCreateInput> = {}): JobCardCreateInput {
  return {
    title: "Plumbing",
    description: "Test description for job card",
    customerName: "Anton",
    customerEmail: "anton@example.co.za",
    priority: "Low",
    assignedTo: "Mike",
    notes: "Check plumbing for Anton",
    ...overrides
  };
}

function baseEdit(overrides: Partial<JobCardEditInput> = {}): JobCardEditInput {
  return {
    status: "Cancelled",
    notes: "Customer initiated cancellation",
    ...overrides
  };
}

/** One isolated scenario (unique title) for a full create → edit → delete run. */
export function buildJobCardScenario(id = "default"): JobCardScenario {
  const suffix = uniqueSuffix();
  const title = `Plumbing-${suffix}`;
  return {
    id,
    searchQuery: title,
    create: baseCreate({
      title,
      notes: `Check plumbing for Anton (${suffix})`
    }),
    edit: baseEdit({
      notes: `Customer initiated cancellation (${suffix})`
    })
  };
}
