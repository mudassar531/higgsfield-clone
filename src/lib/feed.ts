import { ensureSchema, query } from "@/lib/db";
import { SEED_GALLERY } from "@/lib/seed-gallery";
import type { GenerationLike } from "@/components/GenerationCard";

export async function getExploreFeed(): Promise<GenerationLike[]> {
  try {
    await ensureSchema();
    const rows = await query<GenerationLike>`
      SELECT id, prompt, image_url, model, aspect_ratio
      FROM generations ORDER BY created_at DESC LIMIT 48
    `;
    return [...rows, ...SEED_GALLERY];
  } catch {
    // DB not provisioned yet, or briefly unreachable — the marketing/explore
    // page should still render with the static starter gallery.
    return SEED_GALLERY;
  }
}
