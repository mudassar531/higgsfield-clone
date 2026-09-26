# Nova — the idea playground

This direction supersedes the earlier mountain/portal and WebGL hero. The full supplied research was read before implementation. Its art direction and interaction principles informed the work; its example designs were not copied.

## Direction

An oversized typographic poster opens into a working creative instrument. Powder blue, cobalt, pink, and a small yellow accent make the app optimistic. Three original surreal photographs become tactile prints and then lead into an uneven editorial gallery. The creation form stays prominent and practical.

The hero, composer, suggestions, gallery, image viewer, navigation, authentication screens, and credit page use one visual system. The old blob/orbit scene and six-step decorative story section have been removed. Desktop and mobile have separate print compositions.

## Implementation

- `PlaygroundHero` composes the typography, interactive artwork, and existing composer.
- `usePlaygroundMotion` owns GSAP entrance, pointer, and scroll timelines. Media-query contexts revert animations and remove listeners on unmount. No continuous idle animation or WebGL canvas remains.
- Bricolage Grotesque and DM Sans are self-hosted through `next/font`.
- `editorial-art.ts` holds artwork metadata. Editorial studies are explicitly labelled separately from real community generations.
- The existing native dialog retains focus containment, Escape, copy, prompt reuse, and original-image links. A short Web Animations transition connects it with its source card.
- Reduced motion disables the travelling prints, pointer response, large reveals, and dialog transforms. Native scrolling and the operating system cursor remain.
- GSAP is the sole added animation dependency. Three.js, React Three Fiber, and Three.js types were removed.

## Functionality preserved

Real Neon account/database persistence; email/password sign-up and login; Pollinations image generation; Vercel Blob image storage; 100 initial credits; five-credit streamed reservation; failed-generation refunds; account balance refresh; prompt drafts across authentication; style/format selection; prompt suggestions and reuse; personal/community galleries; search and style filters.

No Google OAuth, billing, video, audio, or other unsupported product capability is implied by the redesign. Editorial artwork is not a promise that the live image provider reproduces identical results. The 4:3 pool study reuses its prompt in the supported 16:9 generation format.

## Artwork provenance

Original images generated with the Imagegen skill in built-in tool mode (`image_gen.imagegen`), without references. The delivered assets were converted to WebP using Sharp, quality 84, maximum width 1200. Three files total approximately 243 KB before Next.js responsive image optimization. Hero images have reserved dimensions; gallery images load lazily.

- `public/art/bloom.webp`
- `public/art/pool.webp`
- `public/art/cloud.webp`

Exact prompts:

### Bloom

```text
Create a single portrait 3:4 artwork for Nova, a playful AI image creative studio. High-end surreal editorial still life: a giant vivid orange poppy flower with sculptural folded petals and a curving green stem, growing from a small mirror-polished chrome vase on a soft pink studio floor. Pure saturated light pink background. Hard afternoon studio light, lovely botanical textures, subtle film grain. The flower fills most of the frame, contemporary art photography, bold and very simple graphic composition. No text, no watermark, no frame, no UI. Save the image as an asset.
```

### Pool

```text
Create a single landscape 4:3 artwork for Nova, a playful AI image creative studio. Dreamlike architectural photograph of an impossibly tall pale yellow diving board bending into a loop above a perfectly still cobalt-blue swimming pool, with a tiny vivid orange beach ball reflected in the water. Pastel peach concrete architecture, powder-blue sky, harsh beautiful midday shadows, precise composition, no people. Surreal, playful, premium contemporary editorial photography. No text, no watermark, no frame, no UI. Save the image as an asset.
```

### Cloud

```text
Create a single square artwork for Nova, a playful AI image creative studio. Surreal studio photograph: a small fluffy white cloud held by a cobalt blue balloon string, floating over a bright sky blue seamless background, with three tiny yellow paper birds hovering nearby. Very tactile cloud, soft shadows, charming impossible object, optimistic and minimal composition. Premium contemporary editorial art, crisp photographic detail and a little analog grain. No text, no watermark, no frame, no UI. Save the image as an asset.
```

## Validation — 26 September 2026

Two visual passes covered the complete experience. The second pass corrected travelling artwork over the gallery controls, secondary text contrast, support-page typography, and the mobile navigation Escape behavior.

- TypeScript, ESLint, and production build pass.
- Three real Postgres tests pass (concurrent reservation limits, concurrent refunds/duplicate accounts, saved-image ownership).
- Two generation-stream tests pass (partial byte/Unicode handling and early reservation).
- Real mobile browser sign-up and image generation pass: 100 → 95 while generating; saved result and final 95 balance. Temporary test account/image removed afterward.
- A separate local production server with a deliberately invalid provider key verifies the real failure path: 100 → 95 → 100, visible refund message, enabled controls. Production credentials were not changed.
- Browser interaction checks pass at 1440, 1024, 768, 390, and 320 pixels: suggestions, style/format controls, authentication draft restoration, artwork detail/reuse/Escape, search and filters, keyboard gallery tabs, and mobile menu dismissal.
- Visual/layout checks at 320, 390, 768, 1024, 1440, and 1920 pixels: no horizontal overflow, page errors, console warnings, or failed asset responses in the inspected views.
- Axe WCAG A/AA checks report no violations on home, login, sign-up, credits, and desktop/mobile artwork dialogs after contrast corrections. Automated checks do not cover every accessibility requirement.
- Reduced-motion check: static hero, no WebGL, fully usable creation and gallery.
- Headless Chrome production-build sample: about 5 ms main-thread task time over 1.5 seconds at hero idle and 8 ms below the hero, with zero layout operations in both intervals. This is a local sample, not a cross-device FPS or Lighthouse guarantee.

The first automation run used an unsuitable label lookup for native selects; it was changed to their accessible combobox role. A separate assertion expected the mobile menu at 768px; the actual menu breakpoint is 650px. These were test assumptions, not product defects.

### Before / after

| View | Before | After |
| --- | --- | --- |
| Desktop | [Previous experience](previews/before-playground-1440.webp) | [Idea playground](previews/playground-1440.webp) |
| Mobile | [Previous experience](previews/before-playground-390.webp) | [Mobile composition](previews/playground-390.webp) |
| Gallery | Previous gallery presentation | [Editorial layout](previews/playground-gallery.webp) |

Remaining limitations: tested in desktop Chrome and emulated viewport sizes, not on physical iOS/Android devices. Real community images retain their existing quality and content. Authentication remains email/password; paid top-ups, video/audio generation, email verification, and password reset remain outside the current product scope.

## Production verification

- Design commit `8cdc729` pushed to the public GitHub repository and deployed to Vercel Production; deployment `dpl_m3hjwqWFBDcyTi7QQ6ZMDnJp6SCD` reached `READY`.
- Live alias: https://higgsfield-clone-rose.vercel.app/
- Public desktop (1440px) and mobile (390px) checks pass for the new hero, gallery detail, Escape, search, and overflow, without browser errors or failed asset responses.
- Production mobile signup, live 100 → 95 credit deduction, completed image viewer, and final 95 balance pass. Test account and image were removed afterward.
- The first production image attempt did not reach the result viewer. Vercel logs confirmed a generation-provider error. The next attempt completed. Provider availability remains external; the real refund path was separately verified on the isolated failure server. No mock response or fallback stock result was introduced.
