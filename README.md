# Nova

A from-scratch rebuild of [higgsfield.ai](https://higgsfield.ai)'s core product — describe an
image, get a real AI generation back, browse what others made. Built for the 8x take-home
assignment (rebuild a live product in 24 hours).

Not affiliated with or branded as Higgsfield — same idea, distinct product, so it doesn't
impersonate the original.

## What's here vs. what's left out

Higgsfield is a huge surface: 80+ underlying video/image/lipsync models, Cinema Studio,
Marketing Studio, 3D Jutsu, an MCP/CLI integration, a ChatGPT plugin, Supercomputer agents,
real billing. Reproducing all of it in a day isn't a serious option, so this rebuild picks the
single flow that *is* the product — prompt in, image out — and makes that one real:

- **Real generation**, not a mock: prompts hit [Pollinations](https://pollinations.ai) (no API
  key required) through a server route, get re-hosted on Vercel Blob for permanence, and are
  saved to Postgres.
- **Real accounts**: email/password, scrypt-hashed, JWT session cookie, a credits system
  (100 free credits at sign-up, spent per generation) enforced server-side.
- **Explore feed**: a masonry gallery mixing live generations from every user with a small
  static seed set (see below).
- **Pricing page**: static/illustrative, matching Higgsfield's tiered-plan pattern — explicitly
  *not* wired to real billing. Stripe integration would have eaten the time budget for a fake
  payment flow; a working generator was the better trade.

Explicitly out of scope: video generation, lipsync, 3D, Cinema/Marketing Studio, MCP/CLI,
team accounts, real payments.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind v4) · Neon Postgres · Vercel Blob · deployed on
Vercel.

## Why the seed gallery is static

Pollinations' free tier is flaky under concurrent hot-linking — a dozen simultaneous `<img>`
requests reliably tripped Chrome's `ERR_BLOCKED_BY_ORB`. Live-linking it directly on the
landing page made the first impression a wall of broken images, so the starter Explore set is
pre-downloaded once (`scripts/fetch-seed-images.mjs`) into `public/seed/`. The actual
generator still calls Pollinations live — that's the real interactive path — and its output is
re-hosted on Blob rather than hot-linked, so generated images stay reliable after the fact too.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in SESSION_SECRET at minimum
npm run dev
```

Without `DATABASE_URL` set, the app still runs — the Explore page falls back to the static
seed gallery, and auth/generation routes return a clear error instead of crashing.

## Agent capture

`.agent-logs/` contains the verbatim prompt/response log for every turn of the Claude Code
session that built this, captured automatically via hooks in `.claude/settings.json` (see
`CAPTURE-TEST.md` for how that was verified before any app code was written).
