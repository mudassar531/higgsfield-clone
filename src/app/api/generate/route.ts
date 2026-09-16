import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, query, type Generation } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { generateImage, isAspectRatio, isModelId, MODELS } from "@/lib/generate";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to generate." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const model = typeof body?.model === "string" ? body.model : "";
  const aspectRatio = typeof body?.aspectRatio === "string" ? body.aspectRatio : "";

  if (!prompt) {
    return NextResponse.json({ error: "Describe what you want to create." }, { status: 400 });
  }
  if (prompt.length > 800) {
    return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
  }
  if (!isModelId(model)) {
    return NextResponse.json({ error: "Unknown model." }, { status: 400 });
  }
  if (!isAspectRatio(aspectRatio)) {
    return NextResponse.json({ error: "Unknown aspect ratio." }, { status: 400 });
  }

  await ensureSchema();

  const cost = MODELS.find((m) => m.id === model)!.credits;

  // Reserve credits atomically first so concurrent requests can't both pass a
  // stale check and drive the balance negative.
  const reserved = await query<{ credits: number }>`
    UPDATE users SET credits = credits - ${cost}
    WHERE id = ${userId} AND credits >= ${cost}
    RETURNING credits
  `;
  if (reserved.length === 0) {
    return NextResponse.json({ error: "Not enough credits." }, { status: 402 });
  }
  const remaining = reserved[0].credits;

  let imageUrl: string;
  try {
    imageUrl = await generateImage(prompt, model, aspectRatio);
  } catch {
    await query`UPDATE users SET credits = credits + ${cost} WHERE id = ${userId}`;
    return NextResponse.json(
      { error: "Generation failed — the image model is unavailable right now. Try again." },
      { status: 502 },
    );
  }

  const rows = await query<Generation>`
    INSERT INTO generations (user_id, prompt, image_url, model, aspect_ratio)
    VALUES (${userId}, ${prompt}, ${imageUrl}, ${model}, ${aspectRatio})
    RETURNING id, user_id, prompt, image_url, model, aspect_ratio, created_at
  `;
  const generation = rows[0];

  return NextResponse.json({ generation, credits: remaining });
}
