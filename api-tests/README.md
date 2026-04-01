# API tests (Part C) — Playwright + TypeScript

Automated tests for the **Job Card Management API** using [`@playwright/test` API testing](https://playwright.dev/docs/api-testing) (HTTP only; no browser launch for these specs).

## Project layout

```
api-tests/
├── README.md
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── fixtures/
│   ├── api.ts              # extended test + authedRequest; request factories for auth
│   └── jobcardHelpers.ts   # paths, JSON helpers, list parsing, unique suffixes
└── tests/
    ├── jobcards.crud.spec.ts
    ├── jobcards.auth.spec.ts
    └── jobcards.negative.spec.ts
```

## Prerequisites

- **Node.js 20+**
- API reachable at the configured base URL (default `http://localhost:5000`)

Bring up the app using the root [assessment.md](../assessment.md) (Docker or local API).

## Configuration

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:5000` | Used as Playwright `baseURL` and for request contexts in [`fixtures/api.ts`](./fixtures/api.ts) |
| `API_KEY` | `servcraft-test-key-2025` | Sent as `X-Api-Key` for authenticated requests |

`X-Api-Key` is **not** set in `playwright.config.ts` globally so auth tests can use contexts with no key or a wrong key.

### `playwright.config.ts` (summary)

| Setting | Value |
|--------|--------|
| `testDir` | This package’s `tests/` directory (absolute path from the config file so cwd does not matter) |
| `timeout` | 30s |
| `fullyParallel` | `true` (local); CI uses `workers: 1` and `retries: 1` when `CI` is set |
| Reporters | **list** + **HTML** (`open: "never"`) |
| HTML report folder | **Repository root** `playwright-report/` (shared location with UI tests for `show-report` / IDE) |

## Setup (monorepo)

This repo uses **npm workspaces**. Install **once from the repository root** so there is only one `@playwright/test` install. A second copy under `api-tests/node_modules` can cause *“Requiring @playwright/test second time”* and broken test discovery.

```bash
cd /path/to/servcraftAssessment   # repo root
npm install
npx playwright install
```

(`playwright install` is still required for the Playwright CLI; API tests use the request client only.)

## Run tests (CLI)

All of these use [`api-tests/playwright.config.ts`](./playwright.config.ts).

### From `api-tests/`

```bash
npm test
```

```bash
npx playwright test
```

```bash
npx playwright test playwright.config.ts
```

### From repository root

```bash
npm run test:api
```

```bash
npx playwright test --config api-tests/playwright.config.ts
```

### Optional Playwright flags

From `api-tests/`:

```bash
# Interactive Playwright Test UI (pick / debug tests — API package script)
npm run test:ui
```

```bash
npx playwright test tests/jobcards.crud.spec.ts
npx playwright test -g "authentication"
```

From repo root, pass paths under `api-tests/`:

```bash
npx playwright test --config api-tests/playwright.config.ts api-tests/tests/jobcards.crud.spec.ts
```

Root `npm run test:ui` runs the **UI E2E** suite (`ui-tests`), not this package’s `--ui` mode. For API tests in interactive UI mode, run `npm run test:ui` inside **`api-tests/`**.

### HTML report

After a run, open the last HTML report (written to **`../playwright-report`** relative to this folder, i.e. repo root):

```bash
cd /path/to/servcraftAssessment
npx playwright show-report
```

### Typecheck (optional)

```bash
npx tsc --noEmit -p api-tests/tsconfig.json
```

### Environment examples

**bash / zsh** (from `api-tests/`):

```bash
API_BASE_URL=http://localhost:5000 API_KEY=servcraft-test-key-2025 npm test
```

**PowerShell** (from `api-tests/`):

```powershell
$env:API_BASE_URL="http://localhost:5000"; $env:API_KEY="servcraft-test-key-2025"; npm test
```

## What is covered

| Area | Spec file | Scenarios |
|------|-----------|-----------|
| **CRUD** | [`tests/jobcards.crud.spec.ts`](./tests/jobcards.crud.spec.ts) | POST minimal body (`title`, `customerName`) + asserts JSON `Content-Type`; GET list + asserts JSON `Content-Type`; GET list with `pageSize=1` asserts `items.length <= 1`; GET by id; PUT + GET persistence; DELETE + GET (expects **200** with **empty** body against the current API) |
| **Auth** | [`tests/jobcards.auth.spec.ts`](./tests/jobcards.auth.spec.ts) | GET list **without** `X-Api-Key`; GET list with **invalid** key (both expect **401** or **403**) |
| **Negative / edge** | [`tests/jobcards.negative.spec.ts`](./tests/jobcards.negative.spec.ts) | POST missing `title`; POST missing `customerName`; GET/PUT/DELETE unknown id (**400** or **404**); GET list with large `pageSize` (no 5xx) |

Additional bonus coverage in [`tests/jobcards.crud.spec.ts`](./tests/jobcards.crud.spec.ts):

- **Parameterized create coverage**: POST with `priority` = `Low` / `Medium` / `High` (API defaults `status` to `Open` on create, so priority is used for reliable parameterization).

Tests follow **Arrange / Act / Assert**, avoid sleeps, and use **unique** titles/customers so cases stay independent.
