import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { serviceUnavailable } from "@/lib/api-error";

// Session-dependent — never let Vercel's edge cache serve a stale
// logged-out (or wrong-user) response here.
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: { id: user.id, email: user.email, credits: user.credits },
    });
  } catch (error) {
    return serviceUnavailable("Load account", error);
  }
}
