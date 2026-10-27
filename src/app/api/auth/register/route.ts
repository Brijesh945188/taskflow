/**
 * TaskFlow API — POST /api/auth/register
 * Creates a new user account and sets the JWT auth cookie.
 * Developed by Brijesh Mishra
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  hashPassword,
  signToken,
  AUTH_COOKIE,
  authCookieOptions,
} from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.email("Please provide a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const name = parsed.data.name;
    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered. Try logging in." },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return response;
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
