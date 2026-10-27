# 🚀 TaskFlow — Submission & Evaluation Guide

**Candidate Name:** Brijesh Mishra  
**Course / Program:** Master of Computer Applications (MCA)  
**Project Title:** TaskFlow — Enterprise Full-Stack Task Management System  
**Live GitHub Repository:** [https://github.com/Brijesh945188/taskflow](https://github.com/Brijesh945188/taskflow)  

---

## ⚡ Quick Start: How to Run on Your Machine (in 3 Steps)

### Step 1: Install Dependencies
Open a terminal in this project directory and run:
```bash
npm install
```
*(or `bun install` if you use Bun)*

### Step 2: Database Setup
The SQLite database (`db/custom.db`) is already pre-configured. Just generate the Prisma client:
```bash
npx prisma generate
```

### Step 3: Start the Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser! 🎉

---

## 🔑 Demo Account Credentials

A pre-configured demo account with sample data is ready to use:
- **Email:** `brijesh@taskflow.dev`
- **Password:** `password123`
*(Or click the "Auto-fill" button on the Sign-In tab)*

You can also click **"Create Account"** to register any new account with your own credentials.

---

## 🌟 Key Features to Evaluate

1. **Kanban Board (`@dnd-kit`):**
   - Drag and drop task cards seamlessly between *To Do*, *In Progress*, and *Completed* columns.
   - Column counter badges update dynamically with optimistic UI updates.
2. **Analytics Dashboard (Recharts):**
   - High-level metric cards (Total, In Progress, Completed, Overdue).
   - Priority Donut Chart & 7-Day Completion Velocity Area Chart.
3. **CSV Report Export:**
   - In the **List View**, click the **"Export CSV"** button to instantly generate and download a structured spreadsheet report of all tasks.
4. **Search, Filter & Sorting:**
   - Real-time search across task titles and categories, with priority and due date sorting.
5. **Theme Switcher:**
   - Toggle between Dark, Light, and System themes seamlessly.
6. **Docker & Containerization:**
   - Production-ready `Dockerfile` and `docker-compose.yml` included for one-command deployment (`docker compose up`).

---

## 📑 Project Documentation Index

All detailed technical documentation is available inside the `docs/` folder:

| Document | File Path | Description |
|---|---|---|
| 🎓 **MCA Project Report & Viva Guide** | [`docs/MCA_FINAL_PROJECT_REPORT.md`](docs/MCA_FINAL_PROJECT_REPORT.md) | Complete thesis/synopsis covering SRS, 3-Tier Architecture, ER Diagrams, DFDs, and **Top 15 Viva Q&A**. |
| 🔌 **API Documentation** | [`docs/API.md`](docs/API.md) | Detailed specification of all REST API endpoints, request/response formats, and status codes. |
| 🛠️ **Setup & Deployment Guide** | [`docs/SETUP.md`](docs/SETUP.md) | Step-by-step instructions for local running, Docker setup, and cloud deployments (Vercel/Render). |

---

*Developed by Brijesh Mishra for MCA Major Project Assessment.*
