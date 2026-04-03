import type { Page, Locator } from "@playwright/test";
import type { JobCardCreateInput, JobCardEditInput } from "../fixtures/job-card-ui.types.js";

export class JobCardFormPage {
  constructor(private readonly page: Page) {}

  private titleInput(): Locator {
    return this.page.locator('input[name="title"]');
  }

  private descriptionTextarea(): Locator {
    return this.page.locator('textarea[name="description"]');
  }

  private customerNameInput(): Locator {
    return this.page.locator('input[name="customerName"]');
  }

  private customerEmailInput(): Locator {
    return this.page.locator('input[name="customerEmail"]');
  }

  private priorityCombobox(): Locator {
    return this.page.getByRole("combobox");
  }

  private assignedToInput(): Locator {
    return this.page.locator('input[name="assignedTo"]');
  }

  private notesTextarea(): Locator {
    return this.page.locator('textarea[name="notes"]');
  }

  private statusSelect(): Locator {
    return this.page.locator('select[name="status"]');
  }

  async openNewJobCard(): Promise<void> {
    await this.page.getByRole("link", { name: "New Job Card" }).click();
  }

  async fillCreateForm(data: JobCardCreateInput): Promise<void> {
    await this.titleInput().fill(data.title);
    await this.descriptionTextarea().fill(data.description);
    await this.customerNameInput().fill(data.customerName);
    await this.customerEmailInput().fill(data.customerEmail);
    await this.priorityCombobox().selectOption(data.priority);
    await this.assignedToInput().fill(data.assignedTo);
    await this.notesTextarea().fill(data.notes);
  }

  async submitCreate(): Promise<void> {
    await this.page.getByRole("button", { name: "Create Job Card" }).click();
  }

  async fillEditForm(data: JobCardEditInput): Promise<void> {
    await this.statusSelect().selectOption(data.status);
    await this.notesTextarea().fill(data.notes);
  }

  async saveChanges(): Promise<void> {
    await this.page.getByRole("button", { name: "Save Changes" }).click();
  }
}
