import { NextRequest, NextResponse } from "next/server";
import { insertGeneration, reserveCredits, refundCredits } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { generateImage, isAspectRatio, isModelId, MODELS } from "@/lib/generate";

// Pollinations generation can take several seconds; the platform default
// (10s on Hobby) was cutting requests off mid-flight.
export const maxDuration = 60;

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

  const cost = MODELS.find((m) => m.id === model)!.credits;

  const remaining = await reserveCredits(userId, cost);
  if (remaining === null) {
    return NextResponse.json({ error: "Not enough credits." }, { status: 402 });
  }

  let imageUrl: string;
  try {
    imageUrl = await generateImage(prompt, model, aspectRatio);
  } catch (err) {
    console.error("generateImage failed:", err);
    await refundCredits(userId, remaining + cost);
    return NextResponse.json(
      { error: "Generation failed — the image model is unavailable right now. Try again." },
      { status: 502 },
    );
  }

  const generation = await insertGeneration({
    user_id: userId,
    prompt,
    image_url: imageUrl,
    model,
    aspect_ratio: aspectRatio,
  });

  return NextResponse.json({ generation, credits: remaining });
}
