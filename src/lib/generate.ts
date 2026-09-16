import { put } from "@vercel/blob";

export const MODELS = [
  { id: "flux", label: "Nova Flux", credits: 5 },
  { id: "flux-realism", label: "Nova Realism", credits: 5 },
  { id: "flux-anime", label: "Nova Anime", credits: 5 },
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
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image generation failed (${res.status})`);
  }
  const blob = await res.blob();

  const { url: blobUrl } = await put(`generations/${seed}.jpg`, blob, {
    access: "public",
    contentType: res.headers.get("content-type") ?? "image/jpeg",
  });

  return blobUrl;
}
