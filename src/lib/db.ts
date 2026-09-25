import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

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

export class AccountExistsError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "AccountExistsError";
  }
}

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

// All credentials stay in Postgres. Blob stores only public image files.
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const sql = database();
  const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
  return user as User | undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const sql = database();
  const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
  return user as User | undefined;
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<User> {
  const sql = database();
  const [user] = await sql`
    INSERT INTO users (id, email, password_hash)
    VALUES (${randomUUID()}, ${email}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING *
  `;
  if (!user) throw new AccountExistsError();
  return user as User;
}

function assertCost(cost: number) {
  if (!Number.isSafeInteger(cost) || cost <= 0) {
    throw new Error("Credit cost must be a positive integer");
  }
}

/** Postgres locks the row and checks the balance in the same statement. */
export async function reserveCredits(
  userId: string,
  cost: number,
): Promise<number | null> {
  assertCost(cost);
  const sql = database();
  const [user] = await sql`
    UPDATE users SET credits = credits - ${cost}
    WHERE id = ${userId} AND credits >= ${cost}
    RETURNING credits
  `;
  return user ? (user.credits as number) : null;
}

/** Add back only this request's cost, preserving other in-flight deductions. */
export async function refundCredits(
  userId: string,
  cost: number,
): Promise<number> {
  assertCost(cost);
  const sql = database();
  const [user] = await sql`
    UPDATE users SET credits = credits + ${cost}
    WHERE id = ${userId}
    RETURNING credits
  `;
  if (!user) throw new Error("Cannot refund a missing account");
  return user.credits as number;
}

export async function insertGeneration(
  g: Omit<Generation, "id" | "created_at">,
): Promise<Generation> {
  const sql = database();
  const [generation] = await sql`
    INSERT INTO generations (id, user_id, prompt, image_url, model, aspect_ratio)
    VALUES (${randomUUID()}, ${g.user_id}, ${g.prompt}, ${g.image_url}, ${g.model}, ${g.aspect_ratio})
    RETURNING *
  `;
  return generation as Generation;
}

export async function listGenerations(
  opts: { userId?: string; limit?: number } = {},
): Promise<Generation[]> {
  const sql = database();
  const limit = Math.max(1, Math.min(100, Math.floor(opts.limit ?? 60)));
  const rows = opts.userId
    ? await sql`SELECT * FROM generations WHERE user_id = ${opts.userId} ORDER BY created_at DESC, id DESC LIMIT ${limit}`
    : await sql`SELECT * FROM generations ORDER BY created_at DESC, id DESC LIMIT ${limit}`;
  return rows as Generation[];
}
