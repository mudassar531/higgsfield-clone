import type { GenerationLike } from "./types";

export type EditorialArtwork = GenerationLike & {
  title: string;
  color: string;
};

// Original AI artwork commissioned for Nova's visual identity. These are labelled
// editorial studies everywhere; they are not attributed to users or the live API.
export const EDITORIAL_ART: EditorialArtwork[] = [
  {
    id: "editorial-bloom",
    title: "A bigger kind of bloom",
    image_url: "/art/bloom.webp",
    color: "#f3b5c8",
    model: "flux",
    aspect_ratio: "3:4",
    prompt:
      "A giant vivid orange poppy with sculptural folded petals and a curving green stem in a small mirror-polished chrome vase. Soft pink studio floor and background, hard afternoon light, botanical texture, contemporary surreal editorial photography.",
  },
  {
    id: "editorial-pool",
    title: "Take the scenic dive",
    image_url: "/art/pool.webp",
    color: "#9ac4e5",
    model: "flux",
    aspect_ratio: "4:3",
    prompt:
      "An impossibly tall pale yellow diving board bending into a loop above a still cobalt-blue swimming pool. A tiny orange beach ball reflected in the water, pastel peach architecture, powder-blue sky, midday shadows. Surreal architectural photography.",
  },
  {
    id: "editorial-cloud",
    title: "Head in the clouds",
    image_url: "/art/cloud.webp",
    color: "#b8dcec",
    model: "flux",
    aspect_ratio: "1:1",
    prompt:
      "A small fluffy white cloud held by a cobalt-blue balloon string, floating against a bright sky-blue studio background. Three tiny yellow paper birds hover nearby. Tactile cloud, soft shadows, playful surreal editorial photography.",
  },
];

export function editorialTitle(image: GenerationLike) {
  return EDITORIAL_ART.find((art) => art.id === image.id)?.title;
}
