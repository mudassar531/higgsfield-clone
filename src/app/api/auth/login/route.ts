import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { serviceUnavailable } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password || email.length > 254 || password.length > 256) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
    await setSessionCookie(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, credits: user.credits },
    });
  } catch (error) {
    return serviceUnavailable("Sign in", error);
  }
}
