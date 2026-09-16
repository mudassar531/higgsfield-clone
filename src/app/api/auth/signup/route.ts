import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, query, type User } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  await ensureSchema();

  const existing = await query<{ id: string }>`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  const rows = await query<Pick<User, "id" | "email" | "credits">>`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email, credits
  `;
  const user = rows[0];

  await setSessionCookie(user.id);

  return NextResponse.json({ user });
}
