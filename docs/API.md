# TaskFlow — API Documentation

**Base URL (development):** `http://localhost:3000`
**Content-Type:** `application/json` (all request and response bodies)
**Auth model:** JWT stored in an `httpOnly` cookie named `taskflow_token` (7-day expiry). The browser sends it automatically; with `curl` use `-c cookies.txt` after login and `-b cookies.txt` on subsequent calls.

**Developed by Brijesh Mishra**

---

## Table of Contents

1. [Authentication](#1-authentication)
   - [POST /api/auth/register](#post-apiauthregister)
   - [POST /api/auth/login](#post-apiauthlogin)
   - [POST /api/auth/logout](#post-apiauthlogout)
   - [GET /api/auth/me](#get-apiauthme)
2. [Tasks](#2-tasks)
   - [GET /api/tasks](#get-apitasks)
   - [POST /api/tasks](#post-apitasks)
   - [PATCH /api/tasksid](#patch-apitasksid)
   - [DELETE /api/tasksid](#delete-apitasksid)
3. [Statistics](#3-statistics)
   - [GET /api/stats](#get-apistats)
4. [Sample Data](#4-sample-data)
   - [POST /api/sample-data](#post-apisample-data)
5. [Error Format](#5-error-format)
6. [Status Codes](#6-status-codes)

---

## 1. Authentication

### POST /api/auth/register

Creates a new user account and sets the session cookie.

**Request body**

| Field | Type | Rules |
|---|---|---|
| `name` | string | 2–60 characters, trimmed |
| `email` | string | valid email format (stored lowercase) |
| `password` | string | 6–100 characters |

**Example request**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"Brijesh Mishra","email":"brijesh@example.com","password":"secret123"}'
```

**Success response — `201 Created`**

```json
{
  "user": {
    "id": "clxxxxxxx0001",
    "name": "Brijesh Mishra",
    "email": "brijesh@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors**

| Code | When |
|---|---|
| `400` | Validation failed (e.g. weak password, invalid email) |
| `409` | Email is already registered |

**Notes**
- The password is hashed with bcrypt (10 rounds) before storage — the plaintext never touches the database.
- On success the response sets `taskflow_token` (httpOnly, SameSite=Lax, 7 days).

---

### POST /api/auth/login

Verifies credentials and sets the session cookie.

**Request body**

| Field | Type | Rules |
|---|---|---|
| `email` | string | valid email |
| `password` | string | required |

**Example request**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"brijesh@example.com","password":"secret123"}'
```

**Success response — `200 OK`**

```json
{
  "user": {
    "id": "clxxxxxxx0001",
    "name": "Brijesh Mishra",
    "email": "brijesh@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors**

| Code | When |
|---|---|
| `400` | Invalid input |
| `401` | Wrong email or password (message is deliberately identical for both to prevent user enumeration) |

---

### POST /api/auth/logout

Clears the session cookie (expires it immediately). Requires no body.

**Example request**

```bash
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

**Success response — `200 OK`**

```json
{ "ok": true }
```

---

### GET /api/auth/me

Returns the currently authenticated user, or `null`.

**Example request**

```bash
curl http://localhost:3000/api/auth/me -b cookies.txt
```

**Success response — `200 OK` (authenticated)**

```json
{
  "user": {
    "id": "clxxxxxxx0001",
    "name": "Brijesh Mishra",
    "email": "brijesh@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Success response — `200 OK` (guest)**

```json
{ "user": null }
```

---

## 2. Tasks

All task endpoints require a valid session cookie and operate **only** on the logged-in user's data. Accessing another user's task id returns `404` (deliberately not `403`, to avoid leaking id existence).

**Task object shape**

```json
{
  "id": "clxxxxxxx0042",
  "title": "Ship the portfolio project",
  "description": "Push TaskFlow to GitHub with full documentation",
  "status": "TODO",
  "priority": "HIGH",
  "category": "Development",
  "dueDate": "2025-02-01T12:00:00.000Z",
  "position": 3,
  "completedAt": null,
  "createdAt": "2025-01-20T08:00:00.000Z",
  "updatedAt": "2025-01-20T08:00:00.000Z"
}
```

Allowed values:

- `status`: `TODO` · `IN_PROGRESS` · `COMPLETED`
- `priority`: `LOW` · `MEDIUM` · `HIGH` · `URGENT`

### GET /api/tasks

Lists all tasks of the current user, ordered by kanban `position` then newest first.

**Example request**

```bash
curl http://localhost:3000/api/tasks -b cookies.txt
```

**Success response — `200 OK`**

```json
{
  "tasks": [
    { "id": "clxxxxxxx0042", "title": "Ship the portfolio project", "..." : "..." }
  ]
}
```

---

### POST /api/tasks

Creates a task for the current user.

**Request body**

| Field | Type | Required | Default | Rules |
|---|---|---|---|---|
| `title` | string | ✅ | — | 1–150 chars, trimmed |
| `description` | string \| null | — | `null` | max 2000 chars |
| `status` | string | — | `"TODO"` | one of the allowed statuses |
| `priority` | string | — | `"MEDIUM"` | one of the allowed priorities |
| `category` | string \| null | — | `null` | max 50 chars |
| `dueDate` | ISO 8601 string \| null | — | `null` | e.g. `"2025-02-01T12:00:00.000Z"` |

**Example request**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Ship the portfolio project","priority":"HIGH","category":"Development","dueDate":"2025-02-01T12:00:00.000Z"}'
```

**Success response — `201 Created`**

```json
{
  "task": {
    "id": "clxxxxxxx0042",
    "title": "Ship the portfolio project",
    "description": null,
    "status": "TODO",
    "priority": "HIGH",
    "category": "Development",
    "dueDate": "2025-02-01T12:00:00.000Z",
    "position": 3,
    "completedAt": null,
    "createdAt": "2025-01-20T08:00:00.000Z",
    "updatedAt": "2025-01-20T08:00:00.000Z"
  }
}
```

**Errors**

| Code | When |
|---|---|
| `400` | Validation failed |
| `401` | No/expired session |

---

### PATCH /api/tasks/:id

Partially updates a task. Send only the fields you want to change.

**Behavior notes**

- Setting `status` to `COMPLETED` stamps `completedAt` with the current time.
- Moving a task out of `COMPLETED` clears `completedAt`.
- The client's kanban drag & drop uses this endpoint with `{ "status": "..." }`.

**Example request**

```bash
curl -X PATCH http://localhost:3000/api/tasks/clxxxxxxx0042 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status":"IN_PROGRESS"}'
```

**Success response — `200 OK`**

```json
{
  "task": { "id": "clxxxxxxx0042", "status": "IN_PROGRESS", "..." : "..." }
}
```

**Errors**

| Code | When |
|---|---|
| `400` | Validation failed |
| `401` | No/expired session |
| `404` | Task not found **or** not owned by the current user |

---

### DELETE /api/tasks/:id

Permanently deletes a task owned by the current user.

**Example request**

```bash
curl -X DELETE http://localhost:3000/api/tasks/clxxxxxxx0042 -b cookies.txt
```

**Success response — `200 OK`**

```json
{ "ok": true }
```

**Errors:** `401` (no session) · `404` (not found / not owned)

---

## 3. Statistics

### GET /api/stats

Aggregated dashboard data for the current user, computed **server-side** with Prisma `count` / `groupBy`.

**Example request**

```bash
curl http://localhost:3000/api/stats -b cookies.txt
```

**Success response — `200 OK`**

```json
{
  "total": 10,
  "todo": 4,
  "inProgress": 3,
  "completed": 3,
  "overdue": 1,
  "completionRate": 30,
  "priorityBreakdown": [
    { "priority": "LOW", "count": 1 },
    { "priority": "MEDIUM", "count": 4 },
    { "priority": "HIGH", "count": 3 },
    { "priority": "URGENT", "count": 2 }
  ],
  "categoryBreakdown": [
    { "category": "Development", "count": 4 },
    { "category": "Frontend", "count": 2 }
  ],
  "weeklyTrend": [
    { "day": "Wed", "created": 1, "completed": 0 },
    { "day": "Thu", "created": 0, "completed": 1 }
  ],
  "upcoming": [
    { "id": "clxxxxxxx0042", "title": "Prepare demo", "dueDate": "2025-01-25T12:00:00.000Z", "..." : "..." }
  ]
}
```

**Field notes**

- `completionRate` — integer percentage `0–100` (`completed / total`), `0` when there are no tasks.
- `overdue` — non-completed tasks whose `dueDate` is in the past.
- `weeklyTrend` — the last 7 days (oldest → newest), counting tasks created and completed per day.
- `upcoming` — up to 5 incomplete tasks with a future due date, soonest first.

---

## 4. Sample Data

### POST /api/sample-data

Seeds 9 realistic demo tasks (mixed statuses, priorities, categories and due dates) for the current user. Intentionally only works while the user's board is empty, so it can't clobber real data.

**Example request**

```bash
curl -X POST http://localhost:3000/api/sample-data -b cookies.txt
```

**Success response — `201 Created`**

```json
{ "created": 9 }
```

**Errors**

| Code | When |
|---|---|
| `401` | No session |
| `409` | The user already has tasks |

---

## 5. Error Format

All errors share a consistent JSON shape:

```json
{ "error": "Human-readable message describing the problem" }
```

The UI displays this message directly in toasts, which is why the messages are written to be user-friendly rather than technical.

---

## 6. Status Codes

| Code | Meaning in TaskFlow |
|---|---|
| `200` | Success (read/update/delete) |
| `201` | Resource created (register, create task, seed) |
| `400` | Validation error — check the `error` message |
| `401` | Missing, invalid or expired session; or wrong credentials |
| `404` | Task not found, or not owned by the current user |
| `409` | Conflict — duplicate email, or sample data on a non-empty board |
| `500` | Unexpected server error (details logged server-side) |
