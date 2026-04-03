/** Fields used on the New Job Card form (matches API/job card model). */
export type JobCardCreateInput = {
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
  notes: string;
};

/** Fields updated on the edit form in E2E flows. */
export type JobCardEditInput = {
  status: "Open" | "InProgress" | "Completed" | "Cancelled";
  notes: string;
};

/** One scenario: create payload plus how we edit the same card. */
export type JobCardScenario = {
  id: string;
  create: JobCardCreateInput;
  edit: JobCardEditInput;
  /** Search uses title substring; usually same as create.title. */
  searchQuery: string;
};
