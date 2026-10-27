/**
 * TaskFlow API — PATCH /api/tasks/[id] + DELETE /api/tasks/[id]
 * Ownership is enforced: a user can only modify their own tasks.
 * Developed by Brijesh Mishra
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.string().trim().max(50).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  position: z.number().int().min(0).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/tasks/[id] — partially update a task. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dueDate !== undefined) {
      data.dueDate = parsed.data.dueDate
        ? new Date(parsed.data.dueDate)
        : null;
    }

    // Track completion timestamps for the dashboard trend chart.
    if (parsed.data.status && parsed.data.status !== existing.status) {
      data.completedAt =
        parsed.data.status === "COMPLETED" ? new Date() : null;
    }

    const task = await db.task.update({
      where: { id },
      data,
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("[PATCH /api/tasks/:id]", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/** DELETE /api/tasks/[id] — remove a task permanently. */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await db.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/tasks/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
