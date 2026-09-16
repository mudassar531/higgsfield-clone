import { put, list } from "@vercel/blob";
import { randomUUID } from "crypto";

// Data layer: two JSON files in the same Vercel Blob store used for
// generated images, rather than a separate Postgres database. This was a
// pivot mid-build — Neon (the natural choice) is provisioned through a
// Vercel marketplace integration that requires the account owner to click
// through a terms-of-service acceptance in their browser, and that stayed
// pending. Blob was already wired up with zero extra account friction, and
// at this project's scale (a handful of accounts, a few dozen generations,
// effectively no concurrent writers) a JSON store is a fine trade: no
// schema, no migration, ships now instead of waiting on an external click.
// It does mean concurrent writes race (last write wins) — acceptable here,
// would not be for a real multi-user product.

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

const USERS_PATH = "store/users.json";
const GENERATIONS_PATH = "store/generations.json";

async function readJSON<T>(pathname: string, fallback: T): Promise<T> {
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) return fallback;
  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) return fallback;
  return (await res.json()) as T;
}

async function writeJSON(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await readJSON<User[]>(USERS_PATH, []);
  return users.find((u) => u.email === email);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await readJSON<User[]>(USERS_PATH, []);
  return users.find((u) => u.id === id);
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const users = await readJSON<User[]>(USERS_PATH, []);
  const user: User = {
    id: randomUUID(),
    email,
    password_hash: passwordHash,
    credits: 100,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  await writeJSON(USERS_PATH, users);
  return user;
}

/** Atomically-enough (single read-modify-write) deducts credits. Returns the new balance, or null if insufficient. */
export async function reserveCredits(userId: string, cost: number): Promise<number | null> {
  const users = await readJSON<User[]>(USERS_PATH, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1 || users[idx].credits < cost) return null;
  users[idx].credits -= cost;
  await writeJSON(USERS_PATH, users);
  return users[idx].credits;
}

export async function refundCredits(userId: string, cost: number): Promise<void> {
  const users = await readJSON<User[]>(USERS_PATH, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return;
  users[idx].credits += cost;
  await writeJSON(USERS_PATH, users);
}

export async function insertGeneration(
  g: Omit<Generation, "id" | "created_at">,
): Promise<Generation> {
  const generations = await readJSON<Generation[]>(GENERATIONS_PATH, []);
  const generation: Generation = {
    ...g,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  generations.unshift(generation);
  await writeJSON(GENERATIONS_PATH, generations);
  return generation;
}

export async function listGenerations(
  opts: { userId?: string; limit?: number } = {},
): Promise<Generation[]> {
  const generations = await readJSON<Generation[]>(GENERATIONS_PATH, []);
  const filtered = opts.userId
    ? generations.filter((g) => g.user_id === opts.userId)
    : generations;
  return filtered.slice(0, opts.limit ?? 60);
}
