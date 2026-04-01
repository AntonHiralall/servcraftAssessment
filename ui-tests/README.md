# UI Tests (Part D)

## What this is

Playwright + TypeScript end-to-end tests for the Job Card Management UI, using a **Page Object Model** (see `pages/`), **data-driven** scenarios (`fixtures/`), and stable selectors (`name`, roles, row scoped by title — no `nth()` for row actions).

## Scenarios

| Area | File | What it covers |
|------|------|----------------|
| Lifecycle | `tests/job-cards.e2e.spec.ts` | Data array `lifecycleScenarios` → serial: create (list assertion) → edit (toast + status on list) → delete (message + card gone) |
| Smoke | `tests/smoke.spec.ts` | App root loads |

## Setup

From `ui-tests/`:

```bash
npm install
npx playwright install --with-deps
```

Ensure the web UI is running (e.g. `http://localhost:3001` per [assessment.md](../assessment.md)).

## Configure

- **`UI_BASE_URL`** — Optional. Defaults to `http://localhost:3001` in [playwright.config.ts](./playwright.config.ts). Set explicitly in CI or when the UI is not on localhost.

## Run

From `ui-tests/`:

```bash
npm test
```

From repo root (workspace):

```bash
npm run test:ui
```

## Stability rules

- No hard waits; rely on Playwright auto-waiting and `expect` timeouts.
- Prefer semantic locators; upgrade to `data-test-id` in the app and centralize selector changes in `pages/` only.
- Traces, screenshots, and video on failure are enabled in config.
