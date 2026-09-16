import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, query, type User } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  await ensureSchema();

  const rows = await query<User>`SELECT id, email, password_hash, credits FROM users WHERE email = ${email}`;
  const user = rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await setSessionCookie(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, credits: user.credits },
  });
}
