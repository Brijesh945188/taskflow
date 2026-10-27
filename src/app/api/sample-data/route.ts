/**
 * TaskFlow API — POST /api/sample-data
 * Seeds a realistic set of demo tasks for the logged-in user
 * so the dashboard/board look great on first run.
 * Developed by Brijesh Mishra
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

interface SampleTask {
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string;
  dueOffsetDays: number | null;
}

const SAMPLE_TASKS: SampleTask[] = [
  {
    title: "Design database schema for user module",
    description:
      "Define User, Task and related models with proper indexes and relations using Prisma.",
    status: "COMPLETED",
    priority: "HIGH",
    category: "Development",
    dueOffsetDays: -6,
  },
  {
    title: "Implement JWT authentication flow",
    description:
      "Register, login, logout endpoints with bcrypt hashing and httpOnly cookie sessions.",
    status: "COMPLETED",
    priority: "URGENT",
    category: "Development",
    dueOffsetDays: -4,
  },
  {
    title: "Write API documentation",
    description:
      "Document all REST endpoints with request/response examples in docs/API.md.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    category: "Documentation",
    dueOffsetDays: 1,
  },
  {
    title: "Build responsive dashboard UI",
    description:
      "Stats cards, charts and recent activity using shadcn/ui and Recharts.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    category: "Frontend",
    dueOffsetDays: 2,
  },
  {
    title: "Add drag & drop to Kanban board",
    description:
      "Move tasks between To Do, In Progress and Completed columns with dnd-kit.",
    status: "TODO",
    priority: "MEDIUM",
    category: "Frontend",
    dueOffsetDays: 4,
  },
  {
    title: "Set up ESLint + Prettier pipeline",
    description: "Consistent code style across the repository with lint checks.",
    status: "TODO",
    priority: "LOW",
    category: "DevOps",
    dueOffsetDays: 6,
  },
  {
    title: "Fix overdue: pagination for task list",
    description:
      "Backend pagination with page/limit query params for large task sets.",
    status: "TODO",
    priority: "HIGH",
    category: "Backend",
    dueOffsetDays: -1,
  },
  {
    title: "Prepare project demo presentation",
    description:
      "Walkthrough of architecture, features and live demo for the review meeting.",
    status: "TODO",
    priority: "URGENT",
    category: "Meetings",
    dueOffsetDays: 3,
  },
  {
    title: "Optimize Prisma queries",
    description:
      "Use groupBy aggregates for dashboard stats instead of loading full tables.",
    status: "COMPLETED",
    priority: "MEDIUM",
    category: "Backend",
    dueOffsetDays: -2,
  },
];

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingCount = await db.task.count({ where: { userId: user.id } });
    if (existingCount > 0) {
      return NextResponse.json(
        { error: "Sample data can only be added when your board is empty." },
        { status: 409 }
      );
    }

    const now = Date.now();
    const created = await Promise.all(
      SAMPLE_TASKS.map((sample, index) => {
        const { dueOffsetDays, ...rest } = sample;
        return db.task.create({
          data: {
            ...rest,
            position: index,
            dueDate:
              dueOffsetDays === null
                ? null
                : new Date(
                    now + dueOffsetDays * 24 * 60 * 60 * 1000
                  ),
            completedAt:
              rest.status === "COMPLETED"
                ? new Date(now - Math.abs(dueOffsetDays ?? 1) * 24 * 60 * 60 * 1000)
                : null,
            userId: user.id,
          },
        });
      })
    );

    return NextResponse.json({ created: created.length }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sample-data]", error);
    return NextResponse.json(
      { error: "Failed to create sample data" },
      { status: 500 }
    );
  }
}
