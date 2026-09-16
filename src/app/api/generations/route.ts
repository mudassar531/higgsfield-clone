import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, query, type Generation } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await ensureSchema();
  const scope = req.nextUrl.searchParams.get("scope");

  if (scope === "mine") {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    const rows = await query<Generation>`
      SELECT id, prompt, image_url, model, aspect_ratio, created_at
      FROM generations WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 60
    `;
    return NextResponse.json({ generations: rows });
  }

  const rows = await query<Generation>`
    SELECT id, prompt, image_url, model, aspect_ratio, created_at
    FROM generations ORDER BY created_at DESC LIMIT 60
  `;
  return NextResponse.json({ generations: rows });
}
