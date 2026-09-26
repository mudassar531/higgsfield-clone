# Redesign validation

Checked locally and on production on September 26, 2026 (Asia/Karachi).

## Passed

- `npm run lint`: no errors or warnings.
- `npm run build`: production build and TypeScript compilation succeeded.
- Browser flow: starter prompt, style/format selection, sign-in draft preservation, return-to-studio restoration, image detail dialog, Escape dismissal, prompt reuse and focus, search, empty results, filter reset, guest collection state, and mobile navigation.
- Layouts at 320, 390, 540, 650, 768, 1024, 1440, and 1920 pixels: no horizontal overflow; at least 30 pixels between hero copy and composer.
- Desktop and mobile supporting pages: login, sign-up, and credits render without page errors or horizontal overflow.
- Axe WCAG A/AA checks: no reported violations on the homepage, login, sign-up, credits, or mobile image dialog. Automated checks do not replace all manual accessibility review.

## Issues caught and fixed

- Medium phone widths could wrap the hero text into the absolutely positioned composer. The composer now participates in document flow, including when error text or a reused prompt adds height.
- Several muted labels and the orange button had insufficient contrast. Text and button colors were darkened without changing the visual palette.
- Drafts originally survived only the generate-to-login route. Header auth links now save the current draft too, and the editor persists changes in the browser session.
- The first browser draft-restoration assertion ran before React completed hydration. Waiting for the restored value confirmed the actual flow; it was not a missing draft.
- A wide-screen check timed out while waiting for all lazy image requests to become idle. Rechecking the rendered layout after fonts were ready passed.

## Connected backend and credit checks

- Free Neon database provisioned and connected to Vercel Production, Preview, and Development.
- Imported and field-verified all 7 existing accounts and 6 generations. Password hashes, IDs, credit balances, timestamps, and image URLs are preserved. Private backup is outside Git.
- Three real Postgres integration tests pass: 30 concurrent reservations cannot overspend 100 credits, refunds preserve concurrent deductions, and saved generations retain their owner.
- Real HTTP integration checks pass for signup (100 credits), duplicate signup, incorrect/correct login, invalid prompts without charges, and authenticated account reads.
- Real provider success: the streamed reservation reports 95 credits before the image completes; the image is saved to Blob and the personal gallery with 95 credits remaining.
- Deliberate provider rejection on an isolated local server: the streamed balance changes from 100 to 95, then returns to 100 after the server refunds the failed request. No image record is created. Production credentials were not changed for this check.
- Stream parsing tests pass with one-byte chunks, split Unicode characters, and a reservation delivered before the terminal response.

Mobile browser checks also passed against both real servers: form-based signup, visible 100 → 95 deduction while the button is disabled, saved-image completion at 95, failed-generation recovery to 100, and no horizontal overflow. Repeated axe checks on home, login, and credits reported no violations.

## Production deployment

- Deployed commit `751bf3d` to Vercel Production and aliased at https://higgsfield-clone-rose.vercel.app.
- Vercel production build completed and the deployment reached `READY`.
- The public mobile browser flow passed: signup, streamed 100 → 95 credit deduction, completed image saved to the personal collection, and final 95 credit balance.
- The same production origin passed API signup/login, DB reads, image generation, Blob image retrieval, personal-gallery ownership, and final balance checks.
- The old public account JSON was deleted after the database cutover and verified as HTTP 404. Its private migration backup remains outside Git.
