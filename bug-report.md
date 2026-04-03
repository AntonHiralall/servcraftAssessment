# Bug Report — Job Card Manager

> Template source: `ASSESSMENT.md` (Part B)

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-001 |
| **Title** | Pagination skips a record on pages > 1 (off-by-one) |
| **Severity** | Critical |
| **Component** | API (affects UI) |
| **Steps to Reproduce** | 1. Call `GET /api/jobcards?page=1&pageSize=5` with a valid `X-Api-Key`.<br>2. Note the returned `items` IDs.<br>3. Call `GET /api/jobcards?page=2&pageSize=5` with the same `pageSize`.<br>4. Compare the first ID on page 2 to the last ID on page 1 (should be the next sequential record). |
| **Expected Result** | Page 2 starts immediately after the last record from page 1 (no gaps/duplicates across pages). |
| **Actual Result** | A record is skipped for every page after the first due to an extra `+ 1` in the Skip calculation. |
| **Evidence** | Backend code: `Skip((page - 1) * pageSize + (page > 1 ? 1 : 0))` in `backend/JobCardApi/Program.cs` (lines 65–69). |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-002 |
| **Title** | `GET /api/jobcards/{id}` returns `200 OK` with empty body for non-existent ID |
| **Severity** | High |
| **Component** | API |
| **Steps to Reproduce** | 1. Call `GET /api/jobcards/999999` with header `X-Api-Key: servcraft-test-key-2025`. |
| **Expected Result** | `404 Not Found` with a clear error message indicating the job card does not exist. |
| **Actual Result** | `200 OK` with no content (empty body). |
| **Evidence** | Live response (example):<br><br>```http\nHTTP/1.1 200 OK\nContent-Length: 0\n```\nBackend code returns `Results.Ok(jobCard)` even when `jobCard` is null: `backend/JobCardApi/Program.cs` (lines 81–86). |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-003 |
| **Title** | Searching from page > 1 can use the wrong page (stale state) |
| **Severity** | High |
| **Component** | UI |
| **Steps to Reproduce** | 1. Open Web UI `http://localhost:3001`.<br>2. Click **Next** to go to page 2 (or any page > 1).<br>3. Enter a search term and click **Search**. |
| **Expected Result** | Search resets paging to page 1 and fetches results for page 1 with the new search term. |
| **Actual Result** | Search can fetch using the previous `page` value because `setPage(1)` is async and `fetchData()` is called immediately (using stale `page`). |
| **Evidence** | UI code in `frontend/jobcard-web/pages/index.js` (lines 35–39):<br><br>```js\nconst handleSearch = (e) => {\n  e.preventDefault();\n  setPage(1);\n  fetchData();\n};\n``` |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-004 |
| **Title** | `PUT /api/jobcards/{id}` allows invalid `status` values |
| **Severity** | High |
| **Component** | API |
| **Steps to Reproduce** | 1. Pick an existing job card ID (e.g., from `GET /api/jobcards`).<br>2. Send `PUT /api/jobcards/{id}` with JSON body `{ "status": "DONE" }` and a valid `X-Api-Key`.<br>3. `GET /api/jobcards/{id}` and confirm the stored status. |
| **Expected Result** | `400 Bad Request` because `status` must be one of `Open`, `InProgress`, `Completed`, `Cancelled`. |
| **Actual Result** | Invalid status values are accepted and persisted (no validation on update). |
| **Evidence** | Backend update logic sets status directly without validation in `backend/JobCardApi/Program.cs` (lines 141–146). |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-005 |
| **Title** | `completedAt` is not cleared when status changes away from `Completed` |
| **Severity** | Medium |
| **Component** | API |
| **Steps to Reproduce** | 1. Update a job card to `status: "Completed"` via UI or `PUT`.<br>2. Update the same job card to `status: "Open"` (or `InProgress`).<br>3. Fetch the job card again. |
| **Expected Result** | `completedAt` should be `null` when status is not `Completed` (or behavior should be explicitly defined). |
| **Actual Result** | `completedAt` remains set after moving away from `Completed` because only the `Completed` branch sets it and there’s no clearing branch. |
| **Evidence** | `backend/JobCardApi/Program.cs` sets `CompletedAt` only when status becomes `Completed` (lines 141–146); there is no logic to clear it otherwise. |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-006 |
| **Title** | Edit form doesn’t enforce required fields; API allows empty strings on update |
| **Severity** | Medium |
| **Component** | Both |
| **Steps to Reproduce** | 1. In UI, open **Edit** for any job card.<br>2. Clear **Title** and/or **Customer Name** (leave empty).<br>3. Click **Save Changes**. |
| **Expected Result** | UI blocks save with validation; API rejects with `400 Bad Request` (title/customer name required). |
| **Actual Result** | UI allows submission (no required/validation). API `PUT` accepts and saves empty strings because it only checks for `null` (not empty/whitespace). |
| **Evidence** | UI inputs in `frontend/jobcard-web/pages/edit/[id].js` (lines 51–67) do not use `required` and there is no client-side validation; API update logic in `backend/JobCardApi/Program.cs` updates `Title`/`CustomerName` when not null (lines 129–137). |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-007 |
| **Title** | Email validation in API is too weak (only checks for `@`) |
| **Severity** | Low |
| **Component** | API |
| **Steps to Reproduce** | 1. Create or update a job card with a clearly invalid email that still contains `@` (e.g., `a@`). |
| **Expected Result** | API rejects invalid email formats (or validation rules are documented and enforced consistently). |
| **Actual Result** | API only checks that the string contains `@`, so many invalid emails would pass validation. |
| **Evidence** | `backend/JobCardApi/Program.cs` (lines 97–98): `!request.CustomerEmail.Contains("@")` is the only validation. |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-008 |
| **Title** | After deleting a job card, the success message persists on screen |
| **Severity** | Low |
| **Component** | UI |
| **Steps to Reproduce** | 1. Open Web UI `http://localhost:3001`.<br>2. Click **Delete** on any job card.<br>3. Confirm deletion in the modal.<br>4. Observe the green success message.<br>5. Navigate to another page (e.g., click **Next** / **Previous**) or perform another action (e.g., Search). |
| **Expected Result** | The delete success message should auto-dismiss after a short time, or be cleared when the user performs another action / navigates. |
| **Actual Result** | The delete success message remains visible indefinitely until another deletion overwrites it or the page is refreshed. |
| **Evidence** | Screenshot: `bug-images/bug-008.png` (shows “Job card \\"Electrical inspection\\" deleted.” still displayed). |

---

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-009 |
| **Title** | Search is case-sensitive (should be case-insensitive) |
| **Severity** | Medium |
| **Component** | UI (and/or API search) |
| **Steps to Reproduce** | 1. Open Web UI `http://localhost:3001`.<br>2. In the search box, enter a known job title/customer with different casing (e.g., type `paint exterior walls` instead of `Paint exterior walls`).<br>3. Click **Search**. |
| **Expected Result** | Search matches regardless of letter casing (case-insensitive), returning the same results for `Paint` and `paint`. |
| **Actual Result** | Search returns **0** results when casing doesn’t match exactly. |
| **Evidence** | Screenshots:<br>- `bug-images/bug-009-case-sensitive-no-results.png` (0 results for lowercase search)<br>- `bug-images/bug-009-case-insensitive-expected.png` (result appears with matching case) |



