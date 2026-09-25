import { NextRequest, NextResponse } from "next/server";
import { listGenerations } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { serviceUnavailable } from "@/lib/api-error";

// The "mine" scope is session-dependent — same caching concern as /api/me.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");

  try {
    if (scope === "mine") {
      const userId = await getSessionUserId();
      if (!userId) {
        return NextResponse.json(
          { error: "Sign in required." },
          { status: 401 },
        );
      }
      const generations = await listGenerations({ userId });
      return NextResponse.json({ generations });
    }

    const generations = await listGenerations();
    return NextResponse.json({ generations });
  } catch (error) {
    return serviceUnavailable("Load creations", error);
  }
}
