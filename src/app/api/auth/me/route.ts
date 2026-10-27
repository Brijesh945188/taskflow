/**
 * TaskFlow API — GET /api/auth/me
 * Returns the currently authenticated user (or null).
 * Developed by Brijesh Mishra
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
