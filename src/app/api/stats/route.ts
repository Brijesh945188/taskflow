/**
 * TaskFlow API — GET /api/stats
 * Aggregated dashboard statistics for the logged-in user:
 * counts, completion rate, priority/category breakdowns,
 * 7-day trend and upcoming deadlines.
 * Developed by Brijesh Mishra
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  TASK_PRIORITIES,
  type PrioritySlice,
  type Task,
  type TaskPriority,
  type TrendPoint,
} from "@/lib/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, todo, inProgress, completed, overdue, byPriority, recentTasks] =
      await Promise.all([
        db.task.count({ where: { userId: user.id } }),
        db.task.count({ where: { userId: user.id, status: "TODO" } }),
        db.task.count({ where: { userId: user.id, status: "IN_PROGRESS" } }),
        db.task.count({ where: { userId: user.id, status: "COMPLETED" } }),
        db.task.count({
          where: {
            userId: user.id,
            status: { not: "COMPLETED" },
            dueDate: { lt: now },
          },
        }),
        db.task.groupBy({
          by: ["priority"],
          where: { userId: user.id },
          _count: { priority: true },
        }),
        db.task.findMany({
          where: {
            userId: user.id,
            OR: [
              { createdAt: { gte: weekAgo } },
              { completedAt: { gte: weekAgo } },
              { dueDate: { gte: now } },
            ],
          },
          orderBy: { dueDate: "asc" },
        }),
      ]);

    const completionRate =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    const priorityBreakdown: PrioritySlice[] = TASK_PRIORITIES.map(
      (priority) => ({
        priority,
        count:
          byPriority.find((row) => row.priority === priority)?._count.priority ??
          0,
      })
    );

    // Category breakdown (top 6, non-empty).
    const categoryRows = await db.task.groupBy({
      by: ["category"],
      where: { userId: user.id, category: { not: null } },
      _count: { category: true },
    });
    const categoryBreakdown = categoryRows
      .map((row) => ({
        category: row.category as string,
        count: row._count.category,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 7-day created/completed trend.
    const weeklyTrend: TrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = day.toLocaleDateString("en-US", { weekday: "short" });
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      weeklyTrend.push({
        day: label,
        created: recentTasks.filter(
          (t) =>
            t.createdAt >= dayStart && t.createdAt < dayEnd
        ).length,
        completed: recentTasks.filter(
          (t) =>
            t.completedAt !== null &&
            t.completedAt >= dayStart &&
            t.completedAt < dayEnd
        ).length,
      });
    }

    const upcoming: Task[] = recentTasks
      .filter((t) => t.dueDate && t.dueDate >= now && t.status !== "COMPLETED")
      .slice(0, 5)
      .map((t) => ({
        ...t,
        status: t.status as Task["status"],
        priority: t.priority as TaskPriority,
      }));

    return NextResponse.json({
      total,
      todo,
      inProgress,
      completed,
      overdue,
      completionRate,
      priorityBreakdown,
      categoryBreakdown,
      weeklyTrend,
      upcoming,
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
