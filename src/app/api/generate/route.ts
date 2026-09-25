import { NextRequest, NextResponse } from "next/server";
import { insertGeneration, reserveCredits, refundCredits } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import {
  generateImage,
  isAspectRatio,
  isModelId,
  MODELS,
} from "@/lib/generate";
import { serviceUnavailable } from "@/lib/api-error";

// Pollinations generation can take several seconds; the platform default
// (10s on Hobby) was cutting requests off mid-flight.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to generate." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const model = typeof body?.model === "string" ? body.model : "";
  const aspectRatio =
    typeof body?.aspectRatio === "string" ? body.aspectRatio : "";

  if (!prompt) {
    return NextResponse.json(
      { error: "Describe what you want to create." },
      { status: 400 },
    );
  }
  if (prompt.length > 800) {
    return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
  }
  if (!isModelId(model)) {
    return NextResponse.json({ error: "Unknown model." }, { status: 400 });
  }
  if (!isAspectRatio(aspectRatio)) {
    return NextResponse.json(
      { error: "Unknown aspect ratio." },
      { status: 400 },
    );
  }

  const cost = MODELS.find((m) => m.id === model)!.credits;

  let remaining: number | null;
  try {
    remaining = await reserveCredits(userId, cost);
  } catch (error) {
    return serviceUnavailable("Reserve credits", error);
  }
  if (remaining === null) {
    return NextResponse.json({ error: "Not enough credits." }, { status: 402 });
  }

  try {
    const imageUrl = await generateImage(prompt, model, aspectRatio);
    const generation = await insertGeneration({
      user_id: userId,
      prompt,
      image_url: imageUrl,
      model,
      aspect_ratio: aspectRatio,
    });
    return NextResponse.json({ generation, credits: remaining });
  } catch (err) {
    console.error(
      "Generation failed",
      err instanceof Error ? err.name : "UnknownError",
    );
    let credits: number;
    try {
      // This covers provider, image storage, and record persistence failures.
      credits = await refundCredits(userId, cost);
    } catch (refundError) {
      return serviceUnavailable("Restore generation credits", refundError);
    }
    return NextResponse.json(
      {
        error:
          "This image couldn’t be created. Your credits have been restored. Please try again.",
        credits,
      },
      { status: 502 },
    );
  }
}
