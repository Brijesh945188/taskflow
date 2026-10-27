/**
 * TaskFlow — Server-side authentication helpers
 * JWT signing/verification (jsonwebtoken) + password hashing (bcryptjs)
 * + session extraction from httpOnly cookies.
 * Developed by Brijesh Mishra
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { PublicUser } from "@/lib/types";

const JWT_SECRET: string =
  process.env.JWT_SECRET || "taskflow-dev-secret-change-in-production";
const TOKEN_EXPIRY = "7d";
const BCRYPT_ROUNDS = 10;

export const AUTH_COOKIE = "taskflow_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface TokenPayload {
  userId: string;
  email: string;
}

/** Sign a JWT for the given user. */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/** Verify a JWT and return its payload, or null when invalid/expired. */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") return null;
    if (!decoded.userId || !decoded.email) return null;
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

/** Hash a plaintext password with bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Compare a plaintext password against a bcrypt hash. */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Read the session from the httpOnly cookie and load the user.
 * Returns null when the visitor is not authenticated.
 */
export async function getSessionUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return user;
}

/** Cookie options shared by login/register responses. */
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}
