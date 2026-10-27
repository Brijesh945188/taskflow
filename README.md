<div align="center">

# ✅ TaskFlow — Full-Stack Task Management System

**A production-grade task management application built with Next.js 16, TypeScript, Prisma and Tailwind CSS.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Developed by [Brijesh Mishra](#-author)**
**Website link** -- https://taskflow-jx4h.onrender.com/
</div>

---

## 📖 About The Project

TaskFlow is a complete, full-stack task management system that demonstrates real-world web application development from end to end. It is not a toy CRUD demo — it implements secure authentication, a relational database layer, a validated REST API, and a polished, responsive frontend with analytics and drag-and-drop interactions.

The application allows users to register and log in securely, then organize their work as tasks across a **Kanban board** (To Do → In Progress → Completed) or a sortable **list view**. Every task supports a title, description, priority, category, and due date. An analytics **dashboard** aggregates each user's data server-side and visualizes completion progress, priority mix, and weekly activity trends.

This project was built to demonstrate the ability to design, build, and document a modern web application using an industry-standard technology stack, and is well-suited as a portfolio/assignment submission.

---

## ✨ Features

### Authentication & Security
- 🔐 **JWT-based authentication** — sessions are signed with `jsonwebtoken` and stored in `httpOnly` cookies (7-day expiry, `SameSite=Lax`)
- 🔒 **Password hashing** with `bcryptjs` (10 salt rounds) — plaintext passwords are never stored
- 🛡️ **Protected API routes** — every task endpoint verifies the session and enforces per-user ownership (users can only read/modify their own data)
- ✅ **Input validation** on every endpoint with `zod` schemas

### Task Management
- 📝 **Full CRUD** — create, read, update and delete tasks via a dialog form with validation
- 🚦 **Status workflow** — `To Do → In Progress → Completed` with automatic completion timestamps
- 🔥 **Priorities** — `Low / Medium / High / Urgent` with color-coded badges
- 🏷️ **Categories & due dates** — with overdue detection and highlighting
- ⚡ **Optimistic UI updates** — the interface updates instantly and rolls back automatically if the API call fails

### Kanban Board
- 🎯 **Drag & drop** between columns powered by `@dnd-kit/core`
- 📊 **Live column counts** and per-column quick-add buttons
- 🖱️ **Drag overlay** with visual feedback while dragging

### Analytics Dashboard
- 📈 **Stat cards** — total, to-do, in-progress, completed and overdue counts
- 📊 **Server-side aggregation** — stats computed with Prisma `groupBy`/`count` (not client-side)
- 🥧 **Charts** — priority donut chart and 7-day created/completed trend area chart (Recharts)
- 📅 **Upcoming deadlines** list

### Views & UX
- 🔍 **Search** across title, description and category
- 🎛️ **Filters & sorting** — filter by status/priority, sort by created date, due date or priority
- 🌗 **Dark / light / system theme** with `next-themes`
- 📱 **Fully responsive** — mobile-first layout with dedicated mobile navigation
- 🔔 **Toast notifications** for every action (sonner)
- 🎬 **Sample dataset** — one click seeds 9 realistic tasks to explore the app

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React framework — SSR, routing & API in one project |
| **Language** | TypeScript 5 (strict) | End-to-end type safety |
| **Frontend** | React 19 | UI library |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **UI Components** | shadcn/ui (New York) | Accessible, composable component library |
| **Icons** | Lucide React | Icon set |
| **Charts** | Recharts | Dashboard visualizations |
| **Drag & Drop** | dnd-kit (@dnd-kit/core) | Kanban board interactions |
| **State/Data** | Custom React hooks + fetch | Client state with optimistic updates |
| **Backend** | Next.js API Routes (REST) | 8 endpoints handling auth, tasks & stats |
| **Validation** | Zod | Request payload validation |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | Sessions & password hashing |
| **ORM** | Prisma 6 | Type-safe database client |
| **Database** | SQLite | Simple, zero-config relational DB |
| **Themes** | next-themes | Dark/light mode support |
| **Notifications** | sonner | Toast notifications |
| **Package Manager** | npm / bun compatible | — |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       BROWSER (SPA)                          │
│   src/app/page.tsx — boots session, routes between views     │
│                                                              │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│   │  Landing +   │  │  App Shell   │  │  Task Components  │   │
│   │  Auth Dialog │→ │ Dashboard /  │  │  Board (dnd-kit)  │   │
│   │              │  │ Board / List │  │  List, Dialogs    │   │
│   └─────────────┘  └──────────────┘  └───────────────────┘   │
│                        │ fetch (JSON, httpOnly cookie)       │
└────────────────────────┼─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                 NEXT.JS API ROUTES (REST)                    │
│                                                              │
│   /api/auth/*  → register · login · logout · me              │
│   /api/tasks   → GET (list) · POST (create)                  │
│   /api/tasks/[id] → PATCH (update) · DELETE (remove)         │
│   /api/stats   → GET (aggregated dashboard stats)            │
│   /api/sample-data → POST (seed demo tasks)                  │
│                                                              │
│   Middleware: zod validation → JWT session → ownership check │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                 PRISMA ORM  →  SQLite (db/custom.db)         │
│                                                              │
│   User (id, name, email, password, timestamps)               │
│    └── Task (title, description, status, priority,           │
│         category, dueDate, position, completedAt, …)         │
└──────────────────────────────────────────────────────────────┘
```

**Request lifecycle (example — updating a task):**
1. The client sends `PATCH /api/tasks/:id` with the changed fields.
2. `getSessionUser()` verifies the JWT from the `httpOnly` cookie.
3. The task is loaded and checked for ownership (`task.userId === user.id`).
4. The payload is validated with a zod schema; `status` transitions update `completedAt`.
5. Prisma updates the row; the API returns the fresh task and the UI reflects it.

---

## 📁 Project Structure

```
taskflow/
├── prisma/
│   └── schema.prisma          # Database models (User, Task)
├── db/                        # SQLite database file (generated)
├── src/
│   ├── app/
│   │   ├── api/               # ===== BACKEND (REST API) =====
│   │   │   ├── auth/
│   │   │   │   ├── register/  # POST — create account
│   │   │   │   ├── login/     # POST — sign in
│   │   │   │   ├── logout/    # POST — clear session
│   │   │   │   └── me/        # GET  — current session user
│   │   │   ├── tasks/         # GET, POST — list & create
│   │   │   │   └── [id]/      # PATCH, DELETE — update & remove
│   │   │   ├── stats/         # GET — dashboard aggregation
│   │   │   └── sample-data/   # POST — seed demo tasks
│   │   ├── layout.tsx         # Root layout (theme, toaster)
│   │   ├── page.tsx           # SPA entry — session boot & view routing
│   │   └── globals.css        # Tailwind theme tokens
│   ├── components/
│   │   ├── taskflow/          # ===== FEATURE COMPONENTS =====
│   │   │   ├── landing.tsx    # Marketing page for guests
│   │   │   ├── auth-dialog.tsx# Login / Register form
│   │   │   ├── app-shell.tsx  # Header, nav, footer, view switch
│   │   │   ├── dashboard-view.tsx # Stats cards & charts
│   │   │   ├── board-view.tsx # Kanban board with DnD
│   │   │   ├── list-view.tsx  # Table view with filters
│   │   │   ├── task-card.tsx  # Draggable kanban card
│   │   │   ├── task-dialog.tsx# Create/edit task form
│   │   │   ├── task-badges.tsx# Status/priority badges
│   │   │   └── theme-toggle.tsx
│   │   └── ui/                # shadcn/ui primitives
│   ├── hooks/
│   │   └── use-tasks.ts       # Task state + optimistic CRUD
│   └── lib/
│       ├── auth.ts            # JWT, bcrypt, session helpers
│       ├── db.ts              # Prisma client singleton
│       ├── api.ts             # Typed fetch helper
│       └── types.ts           # Shared types & constants
├── docs/
│   ├── API.md                 # Detailed API reference
│   └── SETUP.md               # Setup, run & deploy guide
├── .env.example               # Environment variable template
├── CONTRIBUTING.md
├── LICENSE
└── README.md                  # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| **Node.js** | 18.18+ (20+ recommended) | https://nodejs.org |
| **npm** | 9+ (ships with Node) | — |

> The project also works with [Bun](https://bun.sh) (`bun install` / `bun run dev`) if you prefer.

### Installation & Run (3 steps)

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
cp .env.example .env
#    (Linux/macOS — on Windows just copy the file manually)

# 3. Create the database and start the dev server
npx prisma db push
npm run dev
```

Open **http://localhost:3000** in your browser, create an account, and you're in! 🎉

> 💡 **Tip:** After registering, click **"Load Sample Tasks"** on the empty board to populate 9 realistic demo tasks and see the dashboard charts in action.

### Production Build

```bash
npm run build
npm start
```

### Useful Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (port 3000) |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Sync the Prisma schema with the database |
| `npx prisma studio` | Open the Prisma data browser (GUI for the DB) |

> Full setup instructions, troubleshooting and deployment notes: **[docs/SETUP.md](docs/SETUP.md)**

---

## 🔌 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create an account, returns session cookie |
| `POST` | `/api/auth/login` | — | Sign in, returns session cookie |
| `POST` | `/api/auth/logout` | ✅ | Clear the session cookie |
| `GET` | `/api/auth/me` | ✅ | Get the current user |
| `GET` | `/api/tasks` | ✅ | List the user's tasks |
| `POST` | `/api/tasks` | ✅ | Create a task |
| `PATCH` | `/api/tasks/:id` | ✅ | Update a task (partial) |
| `DELETE` | `/api/tasks/:id` | ✅ | Delete a task |
| `GET` | `/api/stats` | ✅ | Aggregated dashboard statistics |
| `POST` | `/api/sample-data` | ✅ | Seed 9 demo tasks (empty board only) |

**Quick example:**

```bash
# Register (stores the JWT cookie automatically)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"Brijesh Mishra","email":"brijesh@example.com","password":"secret123"}'

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Ship the portfolio project","priority":"HIGH","category":"Development"}'
```

> Full request/response examples for every endpoint: **[docs/API.md](docs/API.md)**

---

## 🗄️ Database Schema

```
┌─────────────────┐         ┌──────────────────────────────┐
│      User       │         │            Task              │
├─────────────────┤         ├──────────────────────────────┤
│ id       String │ 1     ∞ │ id          String   (PK)    │
│ name     String ├────────►│ title       String           │
│ email    String │         │ description  String?         │
│ password String │         │ status      String  ("TODO"  │
│ createdAt Date  │         │              "IN_PROGRESS"   │
│ updatedAt Date  │         │              "COMPLETED")    │
└─────────────────┘         │ priority    String  (LOW…   │
                            │              URGENT)         │
                            │ category    String?          │
                            │ dueDate     DateTime?        │
                            │ position    Int  (kanban)    │
                            │ completedAt DateTime?        │
                            │ userId      String  (FK)     │
                            │ createdAt / updatedAt       │
                            └──────────────────────────────┘
```

- **One-to-many** — a user owns many tasks; deleting a user cascades to their tasks.
- **Indexes** on `userId` and `status` for fast filtered queries.
- **No enums in SQLite** — status/priority are validated strings (validated by zod at the API boundary).

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `file:../db/custom.db` | SQLite file path (relative to `prisma/`) |
| `JWT_SECRET` | ✅ | *(dev fallback)* | Secret used to sign session tokens — **must be changed in production** |

---

## 🧭 Uploading To GitHub

```bash
# Inside the project folder
git init
git add .
git commit -m "TaskFlow — Full-Stack Task Management System by Brijesh Mishra"

# Create a new repository named `taskflow` on github.com, then:
git branch -M main
git remote add origin https://github.com/<your-username>/taskflow.git
git push -u origin main
```

The included `.gitignore` keeps `node_modules/`, `.next/`, `.env*` and `db/*.db` out of your repository, so only source code and docs are pushed. Anyone who clones the repo can run it with the three installation steps above.

---

## 🎯 Learning Highlights

This project demonstrates:

- Designing a relational schema with **Prisma** and migrating it to a real database
- Building a **REST API** with proper status codes, validation and error messages
- Implementing **JWT authentication** with httpOnly cookies (and why cookies beat localStorage for XSS safety)
- **Ownership enforcement** — every query is scoped to the authenticated user
- **Optimistic UI** with rollback on failure
- **Server-side aggregation** for analytics (Prisma `groupBy`, `count`)
- Accessible, responsive UI composition with **shadcn/ui + Tailwind CSS**
- Documenting a codebase professionally (README, API reference, setup guide)

---

## 📸 Screenshots

> Screenshots of the running application:
>
> | View | Description |
> |---|---|
> | **Landing** | Hero section with feature grid and tech-stack badges |
> | **Dashboard** | Stat cards, completion progress, activity trend & priority charts |
> | **Kanban Board** | Three columns with drag & drop task cards |
> | **List View** | Searchable, filterable, sortable task table with dark mode |

---

## 🗺️ Roadmap / Future Enhancements

Ideas that would take TaskFlow further:

- [ ] Task subtasks & checklists
- [ ] File attachments
- [ ] Team workspaces with role-based access
- [ ] Email reminders for upcoming deadlines
- [ ] OAuth login (Google / GitHub)
- [ ] Real-time collaboration with WebSockets

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

## 👨‍💻 Author

<div align="center">

### **Brijesh Mishra**

*Full-Stack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-@your--username-181717?logo=github)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin)](https://www.linkedin.com/in/your-username)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?logo=gmail)](mailto:your-email@example.com)

**TaskFlow** — Designed & Developed by **Brijesh Mishra** © 2025

</div>
