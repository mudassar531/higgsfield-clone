import { neon } from "@neondatabase/serverless";

type SqlFn = ReturnType<typeof neon>;

let client: SqlFn | undefined;

// Lazy on purpose: reading env vars and constructing the client at module
// scope makes Next's build-time page-data collection crash for every page
// that transitively imports this file when DATABASE_URL isn't set yet
// (e.g. before the Neon integration is provisioned). Deferring to first
// query keeps callers (like getExploreFeed's try/catch) in control.
// Exported as a function (not a pre-bound value) so TypeScript keeps neon()'s
// real overloaded return type at each call site, instead of collapsing to a
// union once through a wrapper.
export function getSql(): SqlFn {
  if (!client) {
    const connectionString =
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.DATABASE_URL_UNPOOLED;
    if (!connectionString) {
      throw new Error(
        "No database connection string found. Set DATABASE_URL (provisioned via the Neon Vercel integration).",
      );
    }
    client = neon(connectionString);
  }
  return client;
}

// neon()'s tagged-template call signature is overloaded on runtime options
// and resolves to a broad union type (`Record<string,any>[] | any[][] | ...`)
// when called through a re-exported reference. Routing every query through
// this generic helper gives call sites a concrete `T[]` instead.
export async function query<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const sql = getSql();
  const result = await sql(strings, ...values);
  return result as unknown as T[];
}

let initialized: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!initialized) {
    initialized = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          credits INTEGER NOT NULL DEFAULT 100,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS generations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          prompt TEXT NOT NULL,
          image_url TEXT NOT NULL,
          model TEXT NOT NULL,
          aspect_ratio TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS generations_created_at_idx ON generations (created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations (user_id)`;
    })();
  }
  return initialized;
}

export type User = {
  id: string;
  email: string;
  password_hash: string;
  credits: number;
  created_at: string;
};

export type Generation = {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string;
  model: string;
  aspect_ratio: string;
  created_at: string;
};
