/**
 * TaskFlow API — GET /api/tasks (list) + POST /api/tasks (create)
 * All routes are protected: require a valid JWT cookie.
 * Developed by Brijesh Mishra
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/types";

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.string().trim().max(50).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

/** GET /api/tasks — list all tasks of the logged-in user. */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await db.task.findMany({
      where: { userId: user.id },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json(
      { error: "Failed to load tasks" },
      { status: 500 }
    );
  }
}

/** POST /api/tasks — create a new task. */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const status = parsed.data.status ?? "TODO";
    if (!TASK_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Place the new task at the end of its column.
    const lastTask = await db.task.findFirst({
      where: { userId: user.id, status },
      orderBy: { position: "desc" },
    });

    const task = await db.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status,
        priority: parsed.data.priority ?? "MEDIUM",
        category: parsed.data.category ?? null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        position: (lastTask?.position ?? -1) + 1,
        userId: user.id,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks]", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
