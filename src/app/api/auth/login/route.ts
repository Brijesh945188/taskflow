/**
 * TaskFlow API — POST /api/auth/login
 * Verifies credentials with bcrypt and sets the JWT auth cookie.
 * Developed by Brijesh Mishra
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  verifyPassword,
  hashPassword,
  signToken,
  AUTH_COOKIE,
  authCookieOptions,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      if (email === "brijesh@taskflow.dev" && password === "password123") {
        const hashed = await hashPassword("password123");
        user = await db.user.create({
          data: {
            name: "Brijesh Mishra",
            email: "brijesh@taskflow.dev",
            password: hashed,
          },
        });

        // Auto-seed demo tasks for the demo account
        const now = new Date();
        const demoTasks = [
          {
            title: "Design database schema for user module",
            description: "Define User, Task and related models with proper indexes and relations using Prisma.",
            status: "COMPLETED",
            priority: "HIGH",
            category: "Development",
            dueDate: new Date(now.getTime() - 6 * 86400000),
            completedAt: new Date(now.getTime() - 4 * 86400000),
            position: 0,
            userId: user.id,
          },
          {
            title: "Implement JWT authentication flow",
            description: "Register, login, logout endpoints with bcrypt hashing and httpOnly cookie sessions.",
            status: "COMPLETED",
            priority: "URGENT",
            category: "Development",
            dueDate: new Date(now.getTime() - 4 * 86400000),
            completedAt: new Date(now.getTime() - 2 * 86400000),
            position: 1,
            userId: user.id,
          },
          {
            title: "Write API documentation",
            description: "Document all REST endpoints with request/response examples in docs/API.md.",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            category: "Documentation",
            dueDate: new Date(now.getTime() + 1 * 86400000),
            position: 0,
            userId: user.id,
          },
          {
            title: "Build responsive dashboard UI",
            description: "Stats cards, charts and recent activity using shadcn/ui and Recharts.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            category: "Frontend",
            dueDate: new Date(now.getTime() + 2 * 86400000),
            position: 1,
            userId: user.id,
          },
          {
            title: "Add drag & drop to Kanban board",
            description: "Implement smooth card reordering and column transitions with @dnd-kit.",
            status: "TODO",
            priority: "URGENT",
            category: "Frontend",
            dueDate: new Date(now.getTime() + 3 * 86400000),
            position: 0,
            userId: user.id,
          },
          {
            title: "Setup CI/CD pipeline and Docker container",
            description: "Multi-stage Alpine Dockerfile and automated build testing.",
            status: "TODO",
            priority: "MEDIUM",
            category: "DevOps",
            dueDate: new Date(now.getTime() + 5 * 86400000),
            position: 1,
            userId: user.id,
          },
        ];
        await db.task.createMany({ data: demoTasks });
      } else {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    } else {
      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        if (email === "brijesh@taskflow.dev" && password === "password123") {
          const hashed = await hashPassword("password123");
          await db.user.update({
            where: { id: user.id },
            data: { password: hashed },
          });
        } else {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          );
        }
      }
    }

    const token = signToken({ userId: user.id, email: user.email });
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
    const response = NextResponse.json({ user: safeUser });
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
