import { put } from "@vercel/blob";
import { GENERATION_COST } from "@/lib/options";

export const MODELS = [
  { id: "flux", label: "Natural", credits: GENERATION_COST },
  { id: "flux-realism", label: "Photographic", credits: GENERATION_COST },
  { id: "flux-anime", label: "Illustrative", credits: GENERATION_COST },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export const ASPECT_RATIOS = {
  "1:1": { width: 1024, height: 1024 },
  "3:4": { width: 864, height: 1152 },
  "16:9": { width: 1280, height: 720 },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;

export function isModelId(value: string): value is ModelId {
  return MODELS.some((m) => m.id === value);
}

export function isAspectRatio(value: string): value is AspectRatio {
  return value in ASPECT_RATIOS;
}

export async function generateImage(
  prompt: string,
  model: ModelId,
  aspectRatio: AspectRatio,
): Promise<string> {
  const { width, height } = ASPECT_RATIOS[aspectRatio];
  const seed = Math.floor(Math.random() * 1_000_000_000);
  // These are creative directions, not claims of three different AI models.
  // Keep the original IDs so existing saved images and remixes stay compatible.
  const direction = {
    flux: "",
    "flux-realism":
      "Photorealistic editorial photograph, natural light and realistic textures. ",
    "flux-anime":
      "Expressive hand-drawn illustration, anime-inspired composition and rich flat colors. ",
  }[model];
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  const endpoint = apiKey
    ? "https://gen.pollinations.ai/image/"
    : "https://image.pollinations.ai/prompt/";
  const url = new URL(`${endpoint}${encodeURIComponent(direction + prompt)}`);
  url.search = new URLSearchParams({
    width: String(width),
    height: String(height),
    model: "flux",
    seed: String(seed),
    nologo: "true",
  }).toString();

  const res = await fetch(url, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    signal: AbortSignal.timeout(45_000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Image generation failed (${res.status})`);
  }
  const contentType = res.headers.get("content-type")?.split(";")[0] ?? "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error("The image provider returned an invalid image");
  }
  const blob = await res.blob();
  if (!blob.size || blob.size > 20 * 1024 * 1024) {
    throw new Error("The image provider returned an invalid image size");
  }

  const extension =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const { url: blobUrl } = await put(`generations/${seed}.${extension}`, blob, {
    access: "public",
    contentType,
  });

  return blobUrl;
}
