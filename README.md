# servcraftAssessment
Tech Assessment for ServCraft

## Tests

- `npm test` — runs API then UI suites with each package’s own Playwright config.
- `npm run test:api` / `npm run test:ui` — one suite at a time.
- `npx playwright test` from the repo root uses `playwright.config.mts`, which defines **api** and **chromium** projects (correct `API_BASE_URL` / `UI_BASE_URL` defaults). Use `--project=api` or `--project=chromium` to run a single project.
