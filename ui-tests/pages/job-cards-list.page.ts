import type { Page, Locator } from "@playwright/test";

export class JobCardsListPage {
  constructor(private readonly page: Page) {}

  async gotoHome(): Promise<void> {
    await this.page.goto("/", { waitUntil: "networkidle" });
  }

  async openJobCardsNav(): Promise<void> {
    await this.page.getByRole("link", { name: "Job Cards" }).click();
  }

  private searchInput(): Locator {
    return this.page.getByRole("textbox", { name: /Search by title or customer/i });
  }

  async search(query: string): Promise<void> {
    await this.searchInput().fill(query);
    await this.page.getByRole("button", { name: "Search" }).click();
  }

  /** Job card title on the list (rendered as a level-3 heading). */
  jobCardHeading(title: string): Locator {
    return this.page.getByRole("heading", { level: 3, name: title, exact: true });
  }

  /**
   * Card actions sit after the title block in DOM order (may be sibling or nested).
   * Scope Edit/Delete to the first matching control following the heading.
   */
  async openEditForTitle(title: string): Promise<void> {
    const h = this.jobCardHeading(title);
    await h
      .locator(
        "xpath=following::a[.//button[normalize-space()='Edit' or contains(normalize-space(.),'Edit')]][1]"
      )
      .click();
  }

  async openDeleteForTitle(title: string): Promise<void> {
    const h = this.jobCardHeading(title);
    await h.locator("xpath=following::button[normalize-space()='Delete'][1]").click();
  }

  /** App uses a "Confirm Delete" panel without dialog role semantics. */
  async confirmDeleteInDialog(): Promise<void> {
    const panel = this.page.getByRole("heading", { name: "Confirm Delete" }).locator("..");
    await panel.getByRole("button", { name: "Delete" }).click();
  }
}
