import { NextRequest, NextResponse } from "next/server";
import { AccountExistsError, createUser } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { serviceUnavailable } from "@/lib/api-error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (password.length < 8 || password.length > 256) {
    return NextResponse.json(
      { error: "Password must be between 8 and 256 characters." },
      { status: 400 },
    );
  }

  try {
    if (!process.env.SESSION_SECRET)
      throw new Error("SESSION_SECRET is not configured");
    const user = await createUser(email, hashPassword(password));
    await setSessionCookie(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, credits: user.credits },
    });
  } catch (error) {
    if (error instanceof AccountExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return serviceUnavailable("Create account", error);
  }
}
