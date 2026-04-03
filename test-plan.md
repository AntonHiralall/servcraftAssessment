# Test Plan — Job Card Management

This document follows **Part A** of the ServCraft QA assessment: **Scope**, **Test Strategy**, **Test Cases** (including cross-field validations per the brief), and **Risks & Assumptions**.

---

## 1. Scope

### What we are testing

- **Job Card Management** end-to-end: creating, viewing, listing, updating, and deleting job cards via the **REST API** and the **web UI**, using the documented fields and allowed values.
- **API:** List (with `page`, `pageSize`, `search`, `status`, `priority`), get by id, create, update, delete; authenticated calls use `X-Api-Key` as specified.
- **Data:** `title`, `description`, `customerName`, `customerEmail`, `status` (`Open`, `InProgress`, `Completed`, `Cancelled`), `priority` (`Low`, `Medium`, `High`), `assignedTo`, `notes`, and server fields `createdAt` / `completedAt` where applicable.
- **UI:** List, search, create and edit forms, delete with confirmation if present, and feedback messages.

### What is out of scope

- Load and performance testing.
- Security beyond API-key authentication (e.g. full OWASP-style reviews).
- Roles and permissions not described in the assessment.
- Notifications, email delivery, and workflows outside job cards.
---

## 2. Test Strategy

### Risk-based prioritization

- **First:** Correctness of **CRUD** on the API and **core UI journeys** (create → visible, edit → reflected, delete → removed).
- **Next:** **Authentication** on the API and **client errors** (missing required data, missing ids).
- **Then:** **Pagination and list behavior**, **validation parity** (UI vs API, POST vs PUT), and **cross-field rules** (e.g. status vs `completedAt`)—much of this is stronger as **manual / exploratory** work before or alongside automation.

### Manual vs automated

- **Automated (Playwright):** API checks for list-only auth failures, CRUD with cleanup, a fixed set of negatives/edges, and UI smoke plus one **serial** create → edit → delete flow (search by the created **title**).
- **Manual / exploratory:** Broader auth (other verbs/routes), deep pagination (gaps, duplicates, page 2+), search + paging interactions, form-only validation, invalid enums on update, email edge cases, and UX around messages and casing—used heavily for **Part B** and for deciding what to automate next.

### How we design checks

- Prefer **independent** tests, **arrange → act → assert**, and assertions on **observable behavior** (status codes, JSON shape, visible UI), not implementation details.

---

## 3. Test Cases

Structured with: **happy path**, **negative/boundary/edge**, **cross-field validations**, **API-specific** (authentication, pagination, error responses), and **UI-specific** (form validation, user flows). The **Automated** column is **Yes** where Playwright covers the row; **No** means recommended manual or future automation.

### 3.1 Happy path / positive scenarios

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| HP-01 | Yes | `POST` with required fields only (`title`, `customerName`) | **200** or **201**; body includes `id` and matching fields; test data removed after check |
| HP-02 | Yes | `GET` list with `page=1`, `pageSize=10` | Success; JSON list with an items collection |
| HP-03 | Yes | `GET` list with `pageSize=1` | At most **one** item on the page |
| HP-04 | Yes | `POST` with each valid `priority` (**Low**, **Medium**, **High**) | Success; `priority` in response matches; cleanup after each |
| HP-05 | Yes | `GET` by id immediately after create | Success; `id` and `title` match created record; cleanup after |
| HP-06 | Yes | `PUT` updates `title`, keeps `customerName`, sets `status` to `InProgress`; then `GET` | Success; persisted title and status; cleanup after |
| HP-07 | Yes | UI: open home | Page loads; document body visible after **network idle** |
| HP-08 | Yes | UI: create card (full scenario data), return to list, search by **title** | Card appears in list for that title |
| HP-09 | Yes | UI: edit **status** and **notes**, save, return to list and search | Success message; list shows updated **status** |
| HP-10 | Yes | UI: delete card with confirmation, return to list and search | Deletion feedback visible; card no longer listed |
| HP-11 | No | `POST` with **all** optional fields valid; `GET` by id | All supplied fields round-trip correctly |
| HP-12 | No | Set `status` to `Completed`; `GET` | `completedAt` set per product rules |


### 3.2 Negative / boundary / edge cases

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| NEG-01 | Yes | `GET` list with **no** `X-Api-Key` | **401** or **403** |
| NEG-02 | Yes | `GET` list with **invalid** `X-Api-Key` | **401** or **403** |
| NEG-03 | Yes | `POST` without `title` | Client error (**4xx**) |
| NEG-04 | Yes | `POST` without `customerName` | Client error (**4xx**) |
| NEG-05 | Yes | `GET` by **non-existent** UUID | **400** or **404** (as asserted in suite) |
| NEG-06 | Yes | `PUT` **non-existent** UUID (valid-shaped body) | **400** or **404** |
| NEG-07 | Yes | `DELETE` **non-existent** UUID | **400** or **404** |
| NEG-08 | Yes | `GET` list with **very large** `pageSize` | Status is not a server error (below **500**) |
| NEG-09 | No | `POST`/`PUT` with invalid `status` or `priority` | **400** if validated; otherwise document behavior |
| NEG-10 | No | `POST`/`PUT` with invalid or empty email when provided | **400** if strict; document if loose |
| NEG-11 | No | Malformed JSON or wrong `Content-Type` on `POST`/`PUT` | **400** / **415** as appropriate |
| NEG-12 | No | Very long strings in text fields | **400** or success within documented limits |
| NEG-13 | No | UI: submit create/edit with empty required fields | Validation blocks or clear errors; no silent save |
| NEG-14 | No | UI: act on stale or deleted record | Clear message; no crash |
| NEG-16 | No | `PUT` existing id with invalid `status` (e.g. `DONE`) | **400**; invalid enum not persisted |
| NEG-17 | No | `PUT` with `title` and/or `customerName` as empty string `""` | **400**; empty strings not persisted |
| NEG-18 | No | `POST`/`PUT` with `customerEmail` clearly invalid but containing `@` (e.g. `a@`) | **400** if strict email rules apply; otherwise document actual rule |

### 3.3 Cross-field validations

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| XF-01 | No | `status` → `Completed`, then `GET` | `completedAt` populated |
| XF-02 | No | `status` from `Completed` to non-completed, then `GET` | `completedAt` cleared or rules documented |
| XF-03 | No | Same rules on **POST** vs **PUT** for required fields, whitespace, enums | Consistent unless partial update is specified |
| XF-04 | No | Optional field **omitted** vs **null** on create/update | Consistent handling |
| XF-05 | No | UI list/detail vs API `GET` by id after edits | Same logical state |
| XF-06 | No | `status` `Completed` then `PUT` to `Open` or `InProgress`; `GET` | `completedAt` is **null** when status is not `Completed` (or product rule documented) |

### 3.4 API-specific scenarios (authentication, pagination, error responses)

#### Authentication

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| API-AUTH-01 | Yes | `GET` list without `X-Api-Key` | **401** or **403** |
| API-AUTH-02 | Yes | `GET` list with bad `X-Api-Key` | **401** or **403** |
| API-AUTH-03 | No | Missing/invalid key on `POST`, `GET` by id, `PUT`, `DELETE` | **401** or **403** per API design |

#### Pagination

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| API-PAGE-01 | Yes | `page=1`, `pageSize=10` | Valid list payload |
| API-PAGE-02 | Yes | `pageSize=1` | At most one item |
| API-PAGE-03 | Yes | Very large `pageSize` | No **5xx** |
| API-PAGE-04 | No | Consecutive pages (e.g. page 1 then 2) with fixed `pageSize` | No skipped or duplicate records across pages |
| API-PAGE-05 | No | List with `search` / `status` / `priority` filters | Only matching rows; stable with paging |
| API-PAGE-06 | No | Same `pageSize`: `page=1` then `page=2`; compare to contiguous slice of a full unpaged or large-page list | First id on page 2 is the immediate successor of last id on page 1 in server order; **no skipped records** |

#### Search (list API)

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| API-SEARCH-01 | No | `GET` list with `search` equal to a known title in different letter casing | Same logical matches as exact-case search (case-insensitive) |

#### Error responses

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| API-ERR-01 | Yes | Missing required fields on `POST` | **4xx** |
| API-ERR-02 | Yes | Unknown id on `GET` / `PUT` / `DELETE` | **400** or **404** per suite |
| API-ERR-03 | Yes | After successful `DELETE`, `GET` same id | **200** with empty/null-like body (current automation contract—not necessarily ideal **404**) |
| API-ERR-04 | No | Error payloads for **400**, **401/403**, **404** | Consistent JSON shape where applicable |
| API-ERR-05 | No | Success responses | `Content-Type` and stable field names for clients |
| API-ERR-06 | No | `GET /api/jobcards/{id}` where `id` is a valid numeric route value but no row exists (e.g. `999999`) | **404** with a clear error payload; not **200** with an empty body |

### 3.5 UI-specific scenarios (form validation, user flows)

#### Form validation

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| UI-VAL-01 | No | Create form: empty required fields | Cannot submit or clear errors shown |
| UI-VAL-02 | No | Create/edit: invalid email | Blocked or server error surfaced clearly |
| UI-VAL-03 | No | Edit form: clear title and/or customer and save | UI and API should reject; document actual behavior |

#### User flows

| ID | Automated | Scenario | Expected outcome |
|----|-----------|----------|------------------|
| UI-FLOW-01 | Yes | Create job card; verify in list (search by title) | Card visible after flow |
| UI-FLOW-02 | Yes | Edit status and notes; verify on list after navigation + search | Updated **status** visible; success feedback |
| UI-FLOW-03 | Yes | Delete job card with confirmation; verify removed from list | Feedback shown; card absent when searched |
| UI-FLOW-04 | No | Search by **customer name** (and casing variants) | Correct results; case behavior documented |
| UI-FLOW-05 | No | Pagination controls with search / filters | Page resets or behavior documented; no stale page |
| UI-FLOW-06 | No | From list **page > 1**, submit **Search** | List request uses **`page=1`** with the new search term (no stale `page` in the first fetch); results match page-1 expectation |
| UI-FLOW-07 | No | After delete success message, **clear search** and use **Next** / **Search** / other navigation | Success message auto-dismisses or clears on the next meaningful action; does not stay indefinitely |
| UI-FLOW-08 | No | Search a known title using **only different casing** | Same card(s) as exact-case search (case-insensitive) |

---

## 4. Risks & Assumptions

### Assumptions

- All normal API usage requires a valid `X-Api-Key` unless testing unauthenticated access.
- `createdAt` is set on create; `completedAt` relates to `Completed` status (exact rules confirmed against the running app).
- The list endpoint supports `page`, `pageSize`, `search`, `status`, and `priority` as documented.
- API and UI are available at the URLs and with the test key described in the assessment setup.

### Risks

- **Validation drift** between UI, `POST`, and `PUT` (empty strings, enums, email).
- **Pagination and search** bugs (off-by-one, stale page after search, case sensitivity)
- **Ambiguous HTTP contracts** (e.g. **200** with empty body for missing or deleted resources).
- **Flaky UI automation** if selectors or timing are unstable; mitigated with stable hooks and state-based waits.