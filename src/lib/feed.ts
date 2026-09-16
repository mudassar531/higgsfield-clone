import { listGenerations } from "@/lib/db";
import { SEED_GALLERY } from "@/lib/seed-gallery";
import type { GenerationLike } from "@/components/GenerationCard";

export async function getExploreFeed(): Promise<GenerationLike[]> {
  try {
    const rows = await listGenerations({ limit: 48 });
    return [...rows, ...SEED_GALLERY];
  } catch {
    // Blob store briefly unreachable — the marketing/explore page should
    // still render with the static starter gallery.
    return SEED_GALLERY;
  }
}
