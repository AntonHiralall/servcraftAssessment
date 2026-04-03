# CI/CD plan — Azure Pipelines (Part E)

We already have Playwright suites at the repo root: `npm run test:api` for the Job Card API and `npm run test:ui` for the browser tests. The assessment assumes Docker Compose for the app (API on 5000, UI on 3001) and an API key in headers—CI should use the same idea via env vars (`API_BASE_URL`, `UI_BASE_URL`, `API_KEY`). Below is how I’d hook that into **Azure Pipelines** without over-engineering it.

---

## 1. When should these tests run?

On **pull requests** I’d run API tests first, then UI. That’s when you care most about catching regressions before merge.

After **merge to main** (or whatever your stable branch is), run the same jobs again so you know the integrated line is still green—not only the PR snapshot.

If the team wants extra safety without slowing PRs, a **nightly** run against the same compose stack or a shared test environment is enough; I wouldn’t block day-to-day merges on nightly alone.

---

## 2. How would you handle test environment setup?

The agent doesn’t have your API or browser app until you put them there. Two realistic patterns:

**Run on the agent (matches this repo well)**  
Check out the code, install Node 20 (Azure’s Node tool installer is fine), then from the repo root run `npm ci` so both workspaces get dependencies. For UI, install browsers with `npx playwright install --with-deps` (Chromium-only is OK if you want speed).

Bring the stack up like the assessment: `docker compose up -d --build`, then wait until `:5000` and `:3001` actually answer—`curl` or a short PowerShell loop is fine so tests don’t fire into a dead server.

Export `API_BASE_URL`, `UI_BASE_URL`, and `API_KEY`. Set `CI=true` if you want the same behavior as today’s Playwright configs (retries on failure, `forbidOnly` on the API package, etc.).

**Point at an existing environment**  
If DevOps already hosts API + UI somewhere, skip compose on the agent and only set the base URLs. Keep the real key in a variable group or secret variable—never in YAML.

If the API needs a database, it should come up with compose as in the assessment so the pipeline isn’t hand-maintaining DB steps.

---

## 3. How would you report test results?

Playwright’s **HTML** report lands under `playwright-report/` in this repo. Publish that folder as a **build artifact** so people can pull `index.html` from the run.

For something easier to pass around and track over time, I’d add **Allure**: wire in `allure-playwright` so each run drops results under `allure-results/`, then run `allure generate` on the agent (CLI installed on the machine, or a small Docker step) and publish `allure-report/` as another artifact. Some orgs use the Azure DevOps **Allure Report** extension to pin the report on the build page—that’s optional and depends on marketplace policy.

Hook up screenshots and traces to Allure where it’s worth the effort; until then, the UI config already keeps screenshot, video, and trace on failure—publish those paths as artifacts too so debugging doesn’t depend on reproducing locally.

---

## 4. How would you handle flaky tests?

Prefer fixing the test: stable data (unique titles), no `sleep`, wait on what the user actually sees.

The configs already **retry once** when `CI` is set; that’s a reasonable cushion but not a substitute for a bad test.

If something’s still random, log a bug or mark the test skipped with a ticket linked so it doesn’t block everyone. Turning retries to 3+ mostly hides problems. Nightly runs help spot patterns without gating every PR.

---

## 5. What gates / quality checks would you recommend before merging a PR?

Make the pipeline **required** in branch policy: PRs shouldn’t merge unless `npm run test:api` and `npm run test:ui` both pass (or `npm test` if you chain them in one script).

Lint, `npm audit`, SonarQube, etc. are fine as extras if the team wants them.

Treat `API_KEY` like any other secret: pipeline secrets / variable groups only.

If the build is red, don’t merge. Simple rule.
