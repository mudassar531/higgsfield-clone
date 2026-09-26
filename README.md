# Nova — a space for imagination

Nova turns a written idea into an image. The original interface pairs an immersive emerald-and-terracotta landscape with a warm, editorial gallery. The composer is on the first screen; browsing, reusing a prompt, and creating belong to one flow.

## Design decisions

- **Create before navigating.** The prompt, style, format, and credit cost are visible together. Starter prompts make the first blank page less intimidating.
- **Borrow an idea, then change it.** Gallery details reveal the exact prompt and settings. “Use this prompt” returns focus to the composer. It is a text-based starting point, not an image-editing claim.
- **Keep the work close.** Drafts survive sign-in and reloads in the current browser session. Completed images live in the account’s collection.
- **Be clear about what is real.** Community images come from saved generations; the included starter artworks are labeled. Styles are creative instructions to one provider, not three invented AI models. Credit balances come from the API.
- **Make room on small screens.** The composer stacks its controls, navigation gets a menu, image details become a sheet, and the gallery becomes two columns. Keyboard focus, Escape, empty states, and reduced motion are handled.

The hero is original generated artwork, not an image copied from a reference website. Its source and exact prompt are in [the art-direction notes](docs/ART-DIRECTION.md).

## Real backend

Next.js App Router and TypeScript, React 19, Tailwind 4, private Neon Postgres, and Vercel Blob for public image files.

- Accounts use scrypt password hashes and an HTTP-only signed session cookie.
- New accounts receive 100 credits. Each generation costs 5. A conditional SQL update prevents concurrent requests from overspending; failures add back only that request’s cost. The API streams the confirmed deduction immediately and streams the refunded balance on failure. The header and composer show the remaining balance; visible tabs also refresh it every 10 seconds.
- Image requests reach Pollinations through the server. Image bytes are validated, saved to Blob, and recorded in Postgres with their owner, prompt, style, and frame.
- Personal collections are scoped to the authenticated account. Finished images and prompts are also visible in the community gallery.
- There are no mock generation responses, invented subscriptions, or nonfunctional billing controls.

The former version used public Blob JSON files for accounts and records. The new adapter requires `DATABASE_URL`; it deliberately does not fall back to public credential storage. Existing records can be imported without changing IDs, balances, hashes, or image URLs.

## Development

```sh
npm install
cp .env.example .env.local
# Set DATABASE_URL, SESSION_SECRET, and BLOB_READ_WRITE_TOKEN.
npm run db:migrate
npm run dev
```

`POLLINATIONS_API_KEY` is optional. With a key, the app uses the authenticated API. Otherwise it uses the shared free endpoint, which can be rate-limited by its provider. Failures are shown honestly and the credit refund is attempted automatically.

Without a database connection, starter images remain browsable and account requests return a service-unavailable response. A connected database is required before deployment or submission.

## Migrating the existing submission

```sh
npm run db:migrate -- --import-blob
```

This creates the schema, saves a private backup under the ignored `.vercel/migration-backups/`, imports existing records in a transaction, and compares every imported field with the source. It never deletes the source. After the new deployment was verified, the old public `store/users.json` was removed from Blob; the private backup remains in the ignored local migration directory.

The production session secret should remain unchanged to preserve existing sessions. Preview deployments also need a session secret.

## Validation

```sh
npm run lint
npm run build
npm run test:db
node --test tests/generation-stream.test.mjs
# With the development server running:
NOVA_TEST_BASE_URL=http://localhost:3000 NOVA_TEST_GENERATION=success node --env-file=.env.local --test tests/api.integration.test.mjs
```

Database integration checks use temporary accounts and clean them up. They cover concurrent credit reservations, refunds during other deductions, duplicate sign-up, and ownership of saved generations. They are skipped when `DATABASE_URL` is absent, not reported as passing.

Browser checks during the redesign cover desktop and mobile layouts, draft restoration through sign-in, starter prompts, style selection, image dialogs, Escape and focus return, prompt reuse, filters, empty states, collection switching, and mobile navigation.

## Agent capture

[CAPTURE-TEST.md](CAPTURE-TEST.md) contains the two independent Codex canaries and the earlier Claude capture proof. Codex’s native transcripts are automatically exported by the installed launchd watcher. `.agent-logs/` contains only original human prompts and completed final responses, with UTC timestamps and model identifiers. Internal agent steps, tool calls, and reasoning are excluded.

On another macOS checkout, install the watcher once:

```sh
python3 scripts/agent-capture/install.py
```

Logs are committed alongside implementation checkpoints. See the capture proof for the disclosed initial backfill, model switches, and machine-specific limitations.
