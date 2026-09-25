# Nova

A small creative instrument: the image is the canvas, the prompt is the command, and other people's images are source material.

The generator, accounts, and credit ledger are unchanged. The interface is a studio, with a slim rail, a composer, and an explore rail.

## Decisions

- **The picture owns the screen.** Create is the studio. Explore is the rail of real images beside it. `/create` redirects home. Looking around does not require an account. Spending credits does.
- **A reference is a brief, not an edit.** Clicking an image loads its prompt, model, and frame. The model still receives only text.
- **No fake plans.** `/pricing` explains the only real economy: 100 credits on sign-up, 5 per image, refunded if generation fails.
- **Quiet chrome.** Off-white studio, one indigo accent, Inter for the interface, mono for credits and shortcuts.

## What is real

- **Generation.** Prompts hit [Pollinations](https://pollinations.ai) through a server route, are re-hosted on Vercel Blob, and are saved.
- **Accounts.** Email and password, scrypt, a JWT session cookie. 100 credits at sign-up, 5 spent per picture, enforced before the model is called.
- **Explore.** Live pictures from every account, plus a static starter set in `public/seed/` so the first view does not depend on Pollinations being up.

Accounts, credit balances, and image records are JSON files in Vercel Blob: `store/users.json` and `store/generations.json` (`src/lib/db.ts`). The image files live in that same bucket. Each update reads a file and writes the whole file back, so two writes at the same moment can drop one of them. Credits are still checked on the server before an image is requested.

Explicitly out: video, lipsync, 3D, studios, billing.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind v4) · Vercel Blob · deployed on Vercel.

## Local development

```bash
npm install
cp .env.example .env.local   # SESSION_SECRET at minimum
npm run dev
```

Without `BLOB_READ_WRITE_TOKEN`, the studio still renders the starter images. Auth and generation return a clear error instead of crashing.

## Agent capture

`.agent-logs/` contains the verbatim prompt/response log for every turn of the Claude Code session that built the first version, captured via hooks in `.claude/settings.json` (see `CAPTURE-TEST.md`).
