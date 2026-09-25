import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { neon } from "@neondatabase/serverless";
import {
  AccountExistsError,
  createUser,
  getUserById,
  insertGeneration,
  listGenerations,
  refundCredits,
  reserveCredits,
} from "../src/lib/db.ts";

const databaseTest = process.env.DATABASE_URL ? test : test.skip;

async function temporaryAccount(t) {
  const user = await createUser(
    `integration-${randomUUID()}@nova.invalid`,
    "integration-test-only",
  );
  t.after(async () => {
    const sql = neon(process.env.DATABASE_URL);
    await sql`DELETE FROM users WHERE id = ${user.id}`;
  });
  return user;
}

databaseTest(
  "concurrent generation requests cannot spend more credits than the account owns",
  async (t) => {
    const user = await temporaryAccount(t);
    const reservations = await Promise.all(
      Array.from({ length: 30 }, () => reserveCredits(user.id, 5)),
    );
    assert.equal(reservations.filter((balance) => balance !== null).length, 20);
    assert.equal(reservations.filter((balance) => balance === null).length, 10);
    assert.equal((await getUserById(user.id)).credits, 0);
    await assert.rejects(() => reserveCredits(user.id, -5));
  },
);

databaseTest(
  "refunds preserve concurrent deductions and duplicate signup cannot create a second account",
  async (t) => {
    const user = await temporaryAccount(t);
    await Promise.all(
      Array.from({ length: 4 }, () => reserveCredits(user.id, 5)),
    );
    await Promise.all([
      refundCredits(user.id, 5),
      refundCredits(user.id, 5),
      reserveCredits(user.id, 5),
    ]);
    assert.equal((await getUserById(user.id)).credits, 85);
    await assert.rejects(
      () => createUser(user.email, "a-different-hash"),
      AccountExistsError,
    );
    assert.equal(
      (await getUserById(user.id)).password_hash,
      "integration-test-only",
    );
  },
);

databaseTest(
  "saved generations persist with their owner and personal galleries exclude other accounts",
  async (t) => {
    const owner = await temporaryAccount(t);
    const other = await temporaryAccount(t);
    const generation = await insertGeneration({
      user_id: owner.id,
      prompt: "Database integration fixture",
      image_url: "https://example.invalid/integration-test.jpg",
      model: "flux",
      aspect_ratio: "1:1",
    });
    assert.equal(
      (await listGenerations({ userId: owner.id }))[0].id,
      generation.id,
    );
    assert.equal((await listGenerations({ userId: other.id })).length, 0);
  },
);
