// Shared pricing for the composer and the server's credit reservation.
export const GENERATION_COST = 5;

export const MODELS = [
  { id: "flux", label: "Imaginative", note: "Let the idea lead." },
  {
    id: "flux-realism",
    label: "Photographic",
    note: "Natural light and lifelike detail.",
  },
  {
    id: "flux-anime",
    label: "Illustrated",
    note: "Expressive lines and color.",
  },
] as const;

export const FRAMES = [
  { id: "1:1", label: "Square", width: 1024, height: 1024 },
  { id: "3:4", label: "Portrait", width: 864, height: 1152 },
  { id: "16:9", label: "Wide", width: 1280, height: 720 },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export type FrameId = (typeof FRAMES)[number]["id"];

export function isModelId(value: string): value is ModelId {
  return MODELS.some((m) => m.id === value);
}

export function isFrameId(value: string): value is FrameId {
  return FRAMES.some((f) => f.id === value);
}

export function modelLabel(id: string) {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}

export function frameMeta(id: string) {
  // Editorial artwork can use a display format the generation API does not offer.
  if (id === "4:3") return { id, label: "Landscape", width: 1200, height: 900 };
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
