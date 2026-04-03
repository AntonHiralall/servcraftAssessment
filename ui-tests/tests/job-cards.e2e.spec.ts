import { test, expect } from "@playwright/test";
import { buildJobCardScenario } from "../fixtures/job-card-ui.data.js";
import { JobCardFormPage } from "../pages/job-card-form.page.js";
import { JobCardsListPage } from "../pages/job-cards-list.page.js";

/** One row = one full create → edit → delete chain; add entries to parameterize lifecycle coverage. */
const lifecycleScenarios = [buildJobCardScenario("lifecycle")];

for (const scenario of lifecycleScenarios) {
  test.describe.serial(`Job card lifecycle (${scenario.id})`, () => {
    test("creates a job card and shows it in the list", async ({ page, baseURL }) => {
      expect(baseURL, "Set UI_BASE_URL or use default in playwright.config.ts").toBeTruthy();

      const list = new JobCardsListPage(page);
      const form = new JobCardFormPage(page);

      await list.gotoHome();
      await form.openNewJobCard();
      await form.fillCreateForm(scenario.create);
      await form.submitCreate();

      await list.gotoHome();
      await list.search(scenario.create.title);
      await expect(list.jobCardHeading(scenario.create.title)).toBeVisible();
    });

    test("edits job card status and notes", async ({ page, baseURL }) => {
      expect(baseURL).toBeTruthy();

      const list = new JobCardsListPage(page);
      const form = new JobCardFormPage(page);

      await list.gotoHome();
      await list.search(scenario.searchQuery);
      await list.openEditForTitle(scenario.create.title);

      await form.fillEditForm(scenario.edit);
      await form.saveChanges();

      await expect(page.getByText("Job card updated successfully!")).toBeVisible();

      await list.gotoHome();
      await list.search(scenario.searchQuery);
      await expect(list.jobCardHeading(scenario.create.title)).toBeVisible();
      // List view shows status pills, not full notes text.
      await expect(list.jobCardHeading(scenario.create.title).locator("..")).toContainText(scenario.edit.status);
    });

    test("deletes job card and removes it from the list", async ({ page, baseURL }) => {
      expect(baseURL).toBeTruthy();

      const list = new JobCardsListPage(page);

      await list.gotoHome();
      await list.openJobCardsNav();
      await list.search(scenario.searchQuery);
      await list.openDeleteForTitle(scenario.create.title);
      await list.confirmDeleteInDialog();

      await expect(page.locator("body")).toContainText(`"${scenario.create.title}" deleted`);

      await list.gotoHome();
      await list.search(scenario.searchQuery);
      await expect(list.jobCardHeading(scenario.create.title)).toHaveCount(0);
    });
  });
}
