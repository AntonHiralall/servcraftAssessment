# ServCraft QA Engineer Assessment

## Overview

Welcome! This assessment is designed to evaluate your QA engineering skills across manual testing, test planning, automation, and CI/CD thinking. You'll work with a small **Job Card Management** application that mimics a real-world service management platform.

**Time budget:** ~3–4 hours (you don't need to spend it all at once)
**What to submit:** A single ZIP or Git repository containing your answers, test code, and bug reports.

---

## Setup Instructions

### Option A: Docker (Recommended)
```bash
docker compose up --build
```
- **API**: http://localhost:5000
- **Web UI**: http://localhost:3001

### Option B: Run Locally

**Backend (.NET 10 SDK required):**
```bash
cd backend/JobCardApi
dotnet run
```
API runs at http://localhost:5000

**Frontend (Node.js 20+ required):**
```bash
cd frontend/jobcard-web
npm install
npm run dev
```
Web UI runs at http://localhost:3001

### API Authentication
All API requests require an `X-Api-Key` header:
```
X-Api-Key: servcraft-test-key-2025
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobcards?page=1&pageSize=10&search=&status=&priority=` | List job cards (paginated) |
| GET | `/api/jobcards/{id}` | Get a single job card |
| POST | `/api/jobcards` | Create a new job card |
| PUT | `/api/jobcards/{id}` | Update a job card |
| DELETE | `/api/jobcards/{id}` | Delete a job card |

### Job Card Fields
- `title` (string, required) — Job card title
- `description` (string) — Detailed description
- `customerName` (string, required) — Customer's name
- `customerEmail` (string) — Customer's email
- `status` (string) — One of: `Open`, `InProgress`, `Completed`, `Cancelled`
- `priority` (string) — One of: `Low`, `Medium`, `High`
- `assignedTo` (string) — Technician name
- `notes` (string) — Additional notes
- `createdAt` (datetime) — Auto-generated
- `completedAt` (datetime) — Auto-set when status changes to Completed

---

## Part A: Test Planning (No Code Required)

**Time estimate: 30–45 minutes**

Write a test plan for the Job Card Management feature. Your plan should include:

1. **Scope**: What are you testing? What's out of scope?
2. **Test Strategy**: Your approach to testing this feature (manual vs. automated, risk-based prioritization)
3. **Test Cases**: A structured list of test cases covering:
   - Happy path / positive scenarios
   - Negative / boundary / edge cases
   - Cross-field validations
   - API-specific scenarios (authentication, pagination, error responses)
   - UI-specific scenarios (form validation, user flows)
4. **Risks & Assumptions**: What risks do you see? What assumptions are you making?

**Deliverable:** A document file (Markdown, Word, or PDF) named `test-plan.*`

---

## Part B: Exploratory / Manual Testing

**Time estimate: 45–60 minutes**

Explore both the API and the web UI. Your goal is to **find as many bugs as possible** and document them clearly.

For each bug found, provide:

| Field | Description |
|-------|-------------|
| **Bug ID** | A short identifier (e.g., BUG-001) |
| **Title** | Clear, concise summary |
| **Severity** | Critical / High / Medium / Low |
| **Component** | API / UI / Both |
| **Steps to Reproduce** | Numbered steps to reproduce the bug |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happens |
| **Evidence** | Screenshot, API response, or curl command showing the bug |

**Deliverable:** A document file named `bug-report.*`

**Tips:**
- Test pagination thoroughly
- Try edge cases with empty/invalid data
- Test what happens with IDs that don't exist
- Compare API validation behavior between POST and PUT
- Pay attention to data display on the frontend

---

## Part C: API Test Automation

**Time estimate: 45–60 minutes**

Write automated tests for the Job Card API. You may use **any** of these frameworks:
- **C# with xUnit** (preferred — our backend stack)
- **Playwright API testing** (JavaScript/TypeScript)
- **Python with pytest + requests**
- **Karate** (if that's your strongest tool)

**Minimum requirements:**
1. Test CRUD operations (Create, Read, Update, Delete)
2. Test authentication (missing/invalid API key)
3. Test at least 3 negative/edge cases
4. Tests should be runnable with a single command (provide instructions)

**Bonus points for:**
- Data-driven / parameterized tests
- Clean test structure (arrange/act/assert)
- Testing pagination behavior
- Assertions on response headers and status codes

**Deliverable:** A folder named `api-tests/` with your test code and a `README.md` explaining how to run them.

---

## Part D: UI Test Automation

**Time estimate: 30–45 minutes**

Write **at least 2** end-to-end UI tests using **Playwright** (JavaScript/TypeScript or C#).

**Suggested test scenarios (pick at least 2):**
1. Create a new job card and verify it appears in the list
2. Search for a job card by customer name
3. Edit a job card's status and verify the update persists
4. Delete a job card and verify it's removed from the list

**Deliverable:** A folder named `ui-tests/` with your test code and a `README.md` explaining how to run them.

---

## Part E: CI/CD Integration (Written)

**Time estimate: 15–20 minutes**

Describe (in writing, no code required) how you would integrate the tests from Parts C and D into an **Azure Pipelines** CI/CD pipeline.

Address:
1. When should these tests run? (PR, merge to main, nightly, etc.)
2. How would you handle test environment setup (database, API, frontend)?
3. How would you report test results?
4. How would you handle flaky tests?
5. What gates/quality checks would you recommend before merging a PR?

**Deliverable:** A document file named `ci-cd-plan.*`

---

## Submission Checklist

```
your-submission/
├── test-plan.md          (Part A)
├── bug-report.md         (Part B)
├── api-tests/            (Part C)
│   ├── README.md
│   └── ... test files
├── ui-tests/             (Part D)
│   ├── README.md
│   └── ... test files
└── ci-cd-plan.md         (Part E)
```

**Submit via:** Email your ZIP/repo link to the hiring contact.

---

## Evaluation Criteria

| Area | Weight | What We're Looking For |
|------|--------|----------------------|
| Test Planning | 20% | Thoroughness, structure, risk awareness |
| Bug Finding | 25% | Number of real bugs found, quality of reports |
| API Automation | 25% | Code quality, coverage, assertions |
| UI Automation | 15% | Working E2E tests, good selectors, reliability |
| CI/CD Thinking | 15% | Practical pipeline design, environment awareness |

Good luck! We value **practical, clear work** over perfection. If you run into setup issues, document them and proceed with what you can.
