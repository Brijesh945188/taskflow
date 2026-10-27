# TaskFlow — Setup, Run & Deploy Guide

A complete walkthrough to get TaskFlow running on your machine — plus troubleshooting and deployment notes.

**Developed by Brijesh Mishra**

---

## 1. Prerequisites

| Tool | Minimum version | Check with | Download |
|---|---|---|---|
| Node.js | 18.18 (20 LTS recommended) | `node -v` | https://nodejs.org |
| npm | 9 | `npm -v` | ships with Node.js |
| Git | any | `git --version` | https://git-scm.com |

> **Bun users:** TaskFlow also runs with Bun. Replace `npm install` with `bun install` and `npm run dev` with `bun run dev`. Everything else is identical.

---

## 2. Installation (step by step)

### Step 1 — Get the code

**If you received a ZIP:**

```bash
# extract it, then enter the folder
cd taskflow
```

**If you are cloning from GitHub:**

```bash
git clone https://github.com/<your-username>/taskflow.git
cd taskflow
```

### Step 2 — Install dependencies

```bash
npm install
```

This installs Next.js 16, React 19, Prisma, Tailwind CSS and all other dependencies listed in `package.json`.

### Step 3 — Create the environment file

```bash
cp .env.example .env
```

On **Windows** (PowerShell):

```powershell
Copy-Item .env.example .env
```

The generated `.env` looks like:

```env
DATABASE_URL=file:../db/custom.db
JWT_SECRET=change-me-to-a-long-random-secret-string
```

- `DATABASE_URL` — where the SQLite file lives (the path is relative to the `prisma/` folder, so `file:../db/custom.db` resolves to `<project>/db/custom.db`). You normally don't need to change this.
- `JWT_SECRET` — used to sign auth tokens. For local development the default is fine; for any public deployment, replace it with a long random string (see §6).

### Step 4 — Create the database

```bash
npx prisma db push
```

This command:

1. Creates `db/custom.db` (SQLite file),
2. Creates the `User` and `Task` tables from `prisma/schema.prisma`,
3. Generates the typed Prisma Client into `node_modules`.

> `npx prisma db push` is safe to run again at any time — it syncs the schema without deleting data (schema-level destructive changes will warn first).

### Step 5 — Start the development server

```bash
npm run dev
```

You should see:

```
▲ Next.js 16
- Local: http://localhost:3000
✓ Ready in 1.2s
```

Open **http://localhost:3000**, click **Get Started**, create your account — and start adding tasks. On the empty board, press **"Load Sample Tasks"** to seed 9 demo tasks and see all dashboard charts populated.

---

## 3. Verify everything works

| Check | How |
|---|---|
| Registration | Register with any email + 6+ character password → you should land inside the app |
| Login persistence | Refresh the page — you stay logged in (httpOnly cookie session) |
| Create task | "New Task" button → fill title → Create |
| Kanban drag & drop | Drag a card from *To Do* to *In Progress* — the column counters update |
| Dashboard | Visit Dashboard — stat cards, progress bar and charts reflect your data |
| Filters | List view → type in search / change status filter |
| Dark mode | Moon/sun icon in the header |
| Logout | Avatar menu → Log out |

### Handy development tools

```bash
npx prisma studio     # GUI to browse the SQLite data at http://localhost:5555
npm run lint          # ESLint check
```

---

## 4. Production build

```bash
npm run build
npm start
```

- `npm run build` compiles and optimizes the app into `.next/`.
- `npm start` serves the production build (default port 3000; change with `PORT=4000 npm start`).

> Note: `npm start` runs `next start`-style production serving. Prisma needs `DATABASE_URL` and `JWT_SECRET` present in the environment (they are read from `.env` automatically).

---

## 5. Resetting the database

Want a clean slate?

```bash
# Option A — delete the file (simplest)
rm db/custom.db
npx prisma db push

# Option B — use the script from package.json
npm run db:push
```

To reset **and** re-seed with demo data: reset, start the app, register, then click "Load Sample Tasks".

---

## 6. Deploying

TaskFlow is a standard Next.js 16 App Router project, so it deploys anywhere Next.js runs.

### Vercel (recommended, ~2 minutes)

1. Push the repo to GitHub (see §7).
2. Go to https://vercel.com → **Add New Project** → import the repo.
3. Add Environment Variables in the Vercel dashboard:
   - `DATABASE_URL=file:../db/custom.db` (or switch to a hosted DB — see below)
   - `JWT_SECRET=<long random string>`
4. Deploy.

> ⚠️ **SQLite on Vercel:** serverless filesystems are ephemeral — the SQLite file resets between deployments. For a real production deployment, switch Prisma to **PostgreSQL** (e.g. Neon, Supabase, Railway): change `provider = "postgresql"` in `prisma/schema.prisma`, update `DATABASE_URL`, and run `npx prisma db push`. The rest of the code works unchanged because all DB access goes through Prisma.

### Railway / Render / Fly.io

These platforms support persistent disks, so SQLite works. Mount a persistent volume, point `DATABASE_URL` at a file on that volume, and run `npm run build && npm start`.

---

## 7. Uploading the project to GitHub

```bash
# inside the project folder
git init
git add .
git commit -m "TaskFlow — Full-Stack Task Management System by Brijesh Mishra"

# create an empty repository named `taskflow` on github.com first, then:
git branch -M main
git remote add origin https://github.com/<your-username>/taskflow.git
git push -u origin main
```

**What gets pushed (and what doesn't):**

The `.gitignore` excludes `node_modules/`, `.next/`, `dev.log`, `.env*` (except `.env.example`) and `db/*.db`. That means:

- ✅ Source code, API routes, components, Prisma schema, docs, `.env.example`, `LICENSE` are pushed.
- ❌ Secrets and the database file are **not** pushed — anyone cloning runs `cp .env.example .env && npx prisma db push` to recreate the database locally (documented in the README).

**Suggested repository settings:** Description = `✅ TaskFlow — Full-Stack Task Management System (Next.js 16, TypeScript, Prisma, Tailwind). Developed by Brijesh Mishra`, Topics = `nextjs, typescript, prisma, tailwindcss, fullstack, task-management, jwt-authentication`.

---

## 8. Troubleshooting

| Problem | Likely cause & fix |
|---|---|
| `Error:Environment variable not found: DATABASE_URL` | You skipped Step 3 — create `.env` (`cp .env.example .env`) |
| `Error code 14: Unable to open the database file` | The `db/` folder doesn't exist — create it, then run `npx prisma db push` |
| `PrismaClientInitializationError: … file is not a database` | Old/corrupt db file — delete `db/custom.db` and re-run `npx prisma db push` |
| `Port 3000 is already in use` | Another process owns the port — stop it, or run `npx next dev -p 3001` |
| Login says "Invalid email or password" | Account doesn't exist (register first) or wrong password — no way to recover a local demo password; just re-register with a new email |
| 401 on task endpoints after logging in | Session cookie missing/expired — log out and log in again |
| Charts/empty states look blank | Click "Load Sample Tasks" on the board, or create a few tasks first |
| `prisma` command not found | Run through npx (`npx prisma db push`) or run `npm install` first |

Still stuck? Check the terminal output — Prisma and Next.js print precise, actionable error messages, and every API route logs server-side errors with a `[METHOD /path]` prefix.

---

## 9. Project scripts reference

| Script | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js rules) |
| `npm run db:push` | `prisma db push` — sync schema to database |
| `npm run db:generate` | Regenerate the Prisma Client |
| `npm run db:migrate` | Create/apply a proper migration (`prisma migrate dev`) |
| `npm run db:reset` | Reset the database (drops data!) |
