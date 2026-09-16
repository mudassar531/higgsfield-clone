import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

// Session-dependent — never let Vercel's edge cache serve a stale
// logged-out (or wrong-user) response here.
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, credits: user.credits },
  });
}
