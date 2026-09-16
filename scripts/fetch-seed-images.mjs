// One-off: pre-downloads the static Explore-page seed gallery into
// public/seed/ so the landing page never depends on Pollinations being up
// or fast at *view* time (live generation still hits Pollinations for real).
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEEDS = [
  { prompt: "a lone astronaut walking across a neon-lit dune at night", model: "flux", w: 864, h: 1152, seed: 101 },
  { prompt: "macro shot of dew on a spider web, soft morning light", model: "flux-realism", w: 1024, h: 1024, seed: 102 },
  { prompt: "cyberpunk street market in the rain, reflections everywhere", model: "flux", w: 1280, h: 720, seed: 103 },
  { prompt: "a fox made of autumn leaves running through a forest", model: "flux-anime", w: 864, h: 1152, seed: 104 },
  { prompt: "brutalist concrete house floating above the clouds", model: "flux-realism", w: 1024, h: 1024, seed: 105 },
  { prompt: "portrait of a queen carved from obsidian and gold", model: "flux", w: 864, h: 1152, seed: 106 },
  { prompt: "underwater library with jellyfish drifting between shelves", model: "flux", w: 1024, h: 1024, seed: 107 },
  { prompt: "vintage motorcycle parked on a mountain road at golden hour", model: "flux-realism", w: 1280, h: 720, seed: 108 },
  { prompt: "a city built inside a giant seashell", model: "flux-anime", w: 1024, h: 1024, seed: 109 },
  { prompt: "close-up of a chameleon with a galaxy pattern on its skin", model: "flux-realism", w: 864, h: 1152, seed: 110 },
  { prompt: "samurai standing in a field of glowing cherry blossoms", model: "flux-anime", w: 864, h: 1152, seed: 111 },
  { prompt: "an origami crane unfolding into a real bird mid-flight", model: "flux", w: 1280, h: 720, seed: 112 },
];

async function fetchWithRetry(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      console.warn(`  attempt ${i + 1}: HTTP ${res.status}`);
    } catch (err) {
      console.warn(`  attempt ${i + 1}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error(`Failed after ${attempts} attempts: ${url}`);
}

for (let i = 0; i < SEEDS.length; i++) {
  const s = SEEDS[i];
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(s.prompt)}?width=${s.w}&height=${s.h}&model=${s.model}&seed=${s.seed}&nologo=true`;
  const dest = path.join(__dirname, "..", "public", "seed", `${i}.jpg`);
  console.log(`[${i + 1}/${SEEDS.length}] ${s.prompt}`);
  const buf = await fetchWithRetry(url);
  await writeFile(dest, buf);
  console.log(`  saved ${(buf.length / 1024).toFixed(0)}kb -> public/seed/${i}.jpg`);
}

console.log("Done.");
