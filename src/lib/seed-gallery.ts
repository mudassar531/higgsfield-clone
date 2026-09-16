import type { GenerationLike } from "@/components/GenerationCard";

// Static starter set so Explore isn't empty before anyone has generated
// anything. Pre-downloaded once (scripts/fetch-seed-images.mjs) into
// public/seed/ rather than hot-linking Pollinations on every page view —
// that endpoint is flaky enough under concurrent load (ERR_BLOCKED_BY_ORB)
// that live-linking a dozen images on the landing page was unusable.
const PROMPTS = [
  "a lone astronaut walking across a neon-lit dune at night",
  "macro shot of dew on a spider web, soft morning light",
  "cyberpunk street market in the rain, reflections everywhere",
  "a fox made of autumn leaves running through a forest",
  "brutalist concrete house floating above the clouds",
  "portrait of a queen carved from obsidian and gold",
  "underwater library with jellyfish drifting between shelves",
  "vintage motorcycle parked on a mountain road at golden hour",
  "a city built inside a giant seashell",
  "close-up of a chameleon with a galaxy pattern on its skin",
  "samurai standing in a field of glowing cherry blossoms",
  "an origami crane unfolding into a real bird mid-flight",
];

export const SEED_GALLERY: GenerationLike[] = PROMPTS.map((prompt, i) => ({
  id: `seed-${i}`,
  prompt,
  model: "flux",
  aspect_ratio: "1:1",
  image_url: `/seed/${i}.jpg`,
}));
