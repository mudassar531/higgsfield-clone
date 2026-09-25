import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { list } from "@vercel/blob";

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("Set DATABASE_URL before running the migration.");
  const sql = neon(process.env.DATABASE_URL);
  const schema = await readFile(
    new URL("../db/schema.sql", import.meta.url),
    "utf8",
  );
  const statements = schema
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  await sql.transaction(statements.map((statement) => sql.query(statement)));
  console.log("Postgres schema is ready.");

  if (!process.argv.includes("--import-blob")) return;
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error("Set BLOB_READ_WRITE_TOKEN to import existing records.");

  async function readLegacy(pathname) {
    const { blobs } = await list({ prefix: pathname, limit: 100 });
    const source = blobs.find((blob) => blob.pathname === pathname);
    if (!source)
      throw new Error(
        `Required source ${pathname} is missing; import stopped.`,
      );
    const response = await fetch(source.url, { cache: "no-store" });
    if (!response.ok)
      throw new Error(`Cannot read ${pathname}; import stopped.`);
    const records = await response.json();
    if (!Array.isArray(records))
      throw new Error(`Invalid data in ${pathname}; import stopped.`);
    return records;
  }

  const [users, generations] = await Promise.all([
    readLegacy("store/users.json"),
    readLegacy("store/generations.json"),
  ]);

  // This directory is already ignored by Git. Never put an account snapshot in the repo logs.
  const backupDirectory = new URL(
    "../.vercel/migration-backups/",
    import.meta.url,
  );
  await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const backupPath = join(
    backupDirectory.pathname,
    `blob-${new Date().toISOString().replaceAll(":", "-")}.json`,
  );
  await writeFile(backupPath, JSON.stringify({ users, generations }), {
    mode: 0o600,
    flag: "wx",
  });

  const writes = [
    ...users.map(
      (user) => sql`
      INSERT INTO users (id, email, password_hash, credits, created_at)
      VALUES (${user.id}, ${user.email}, ${user.password_hash}, ${user.credits}, ${user.created_at})
      ON CONFLICT (id) DO NOTHING
    `,
    ),
    ...generations.map(
      (generation) => sql`
      INSERT INTO generations (id, user_id, prompt, image_url, model, aspect_ratio, created_at)
      VALUES (${generation.id}, ${generation.user_id}, ${generation.prompt}, ${generation.image_url},
        ${generation.model}, ${generation.aspect_ratio}, ${generation.created_at})
      ON CONFLICT (id) DO NOTHING
    `,
    ),
  ];
  if (writes.length) await sql.transaction(writes);

  const [savedUsers, savedGenerations] = await sql.transaction([
    sql`SELECT * FROM users`,
    sql`SELECT * FROM generations`,
  ]);

  function verify(source, destination, fields) {
    const indexed = new Map(destination.map((row) => [row.id, row]));
    return source.every((row) => {
      const saved = indexed.get(row.id);
      return (
        saved &&
        fields.every((field) =>
          field === "created_at"
            ? new Date(row[field]).getTime() ===
              new Date(saved[field]).getTime()
            : row[field] === saved[field],
        )
      );
    });
  }

  const usersMatch = verify(users, savedUsers, [
    "id",
    "email",
    "password_hash",
    "credits",
    "created_at",
  ]);
  const generationsMatch = verify(generations, savedGenerations, [
    "id",
    "user_id",
    "prompt",
    "image_url",
    "model",
    "aspect_ratio",
    "created_at",
  ]);
  if (!usersMatch || !generationsMatch) {
    throw new Error(
      "Imported records differ from the source snapshot. Source files and private backup are preserved.",
    );
  }
  console.log(
    `Verified ${users.length} accounts and ${generations.length} generations, including every stored field.`,
  );
  console.log(
    "Private backup saved under .vercel/migration-backups/. Source Blob files were not changed.",
  );
}

main().catch((error) => {
  // Driver errors can contain record values. Only print our own validation messages.
  console.error(
    error.name === "Error"
      ? error.message
      : `Database migration failed (${error.name}).`,
  );
  process.exitCode = 1;
});
