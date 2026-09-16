import { NextResponse } from "next/server";
import { ensureSchema, query, type User } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  await ensureSchema();
  const rows = await query<Pick<User, "id" | "email" | "credits">>`SELECT id, email, credits FROM users WHERE id = ${userId}`;
  const user = rows[0];

  return NextResponse.json({ user: user ?? null });
}
