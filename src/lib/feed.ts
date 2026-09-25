import { listGenerations } from "@/lib/db";
import { SEED_GALLERY } from "@/lib/seed-gallery";
import type { GenerationLike } from "@/lib/types";

export async function getExploreFeed(): Promise<GenerationLike[]> {
  try {
    const rows = await listGenerations({ limit: 48 });
    return [...rows, ...SEED_GALLERY];
  } catch {
    return SEED_GALLERY;
  }
}
