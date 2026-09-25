import type { GenerationLike } from "@/lib/types";

// Starter sheet so the desk isn't empty before anyone has generated.
// Pre-downloaded once (scripts/fetch-seed-images.mjs) into public/seed/.
// Model and frame match that script, so picking a frame loads an honest brief.
const SEEDS: Omit<GenerationLike, "id" | "image_url">[] = [
  {
    prompt: "a lone astronaut walking across a neon-lit dune at night",
    model: "flux",
    aspect_ratio: "3:4",
  },
  {
    prompt: "macro shot of dew on a spider web, soft morning light",
    model: "flux-realism",
    aspect_ratio: "1:1",
  },
  {
    prompt: "cyberpunk street market in the rain, reflections everywhere",
    model: "flux",
    aspect_ratio: "16:9",
  },
  {
    prompt: "a fox made of autumn leaves running through a forest",
    model: "flux-anime",
    aspect_ratio: "3:4",
  },
  {
    prompt: "brutalist concrete house floating above the clouds",
    model: "flux-realism",
    aspect_ratio: "1:1",
  },
  {
    prompt: "portrait of a queen carved from obsidian and gold",
    model: "flux",
    aspect_ratio: "3:4",
  },
  {
    prompt: "underwater library with jellyfish drifting between shelves",
    model: "flux",
    aspect_ratio: "1:1",
  },
  {
    prompt: "vintage motorcycle parked on a mountain road at golden hour",
    model: "flux-realism",
    aspect_ratio: "16:9",
  },
  {
    prompt: "a city built inside a giant seashell",
    model: "flux-anime",
    aspect_ratio: "1:1",
  },
  {
    prompt: "close-up of a chameleon with a galaxy pattern on its skin",
    model: "flux-realism",
    aspect_ratio: "3:4",
  },
  {
    prompt: "samurai standing in a field of glowing cherry blossoms",
    model: "flux-anime",
    aspect_ratio: "3:4",
  },
  {
    prompt: "an origami crane unfolding into a real bird mid-flight",
    model: "flux",
    aspect_ratio: "16:9",
  },
];

export const SEED_GALLERY: GenerationLike[] = SEEDS.map((seed, i) => ({
  ...seed,
  id: `seed-${i}`,
  image_url: `/seed/${i}.jpg`,
}));
