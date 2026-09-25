import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { neon } from "@neondatabase/serverless";
import { del } from "@vercel/blob";
import { readGenerationEvents } from "../src/lib/generation-stream.ts";

const base = process.env.NOVA_TEST_BASE_URL;
const integrationTest = base && process.env.DATABASE_URL ? test : test.skip;

integrationTest(
  "signup, login, streamed deduction and generation settlement use the real database",
  { timeout: 90000 },
  async (t) => {
    const sql = neon(process.env.DATABASE_URL);
    const email = `api-test-${randomUUID()}@nova.invalid`;
    const password = randomUUID();
    let cookie = "";
    async function request(path, body, headers = {}) {
      return fetch(`${base}${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    }
    t.after(async () => {
      const images =
        await sql`SELECT image_url FROM generations WHERE user_id IN (SELECT id FROM users WHERE email = ${email})`;
      for (const image of images) await del(image.image_url);
      await sql`DELETE FROM users WHERE email = ${email}`;
    });
    const signup = await request("/api/auth/signup", { email, password });
    assert.equal(signup.status, 200);
    assert.equal((await signup.json()).user.credits, 100);
    cookie = signup.headers.get("set-cookie").split(";")[0];
    assert.equal((await (await request("/api/me")).json()).user.credits, 100);
    assert.equal(
      (await request("/api/auth/signup", { email, password })).status,
      409,
    );
    assert.equal(
      (
        await request("/api/auth/login", {
          email,
          password: "incorrect-password",
        })
      ).status,
      401,
    );
    const login = await request("/api/auth/login", { email, password });
    assert.equal(login.status, 200);
    cookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal(
      (
        await request("/api/generate", {
          prompt: "",
          model: "flux",
          aspectRatio: "1:1",
        })
      ).status,
      400,
    );
    assert.equal((await (await request("/api/me")).json()).user.credits, 100);

    if (!process.env.NOVA_TEST_GENERATION) return;
    const response = await request(
      "/api/generate",
      {
        prompt:
          "A small terracotta vase beside a sunlit window, editorial still life photography",
        model: "flux",
        aspectRatio: "1:1",
      },
      { Accept: "application/x-ndjson" },
    );
    assert.equal(response.status, 200);
    const events = readGenerationEvents(response.body);
    assert.deepEqual((await events.next()).value, {
      type: "reserved",
      credits: 95,
      cost: 5,
    });
    const final = (await events.next()).value;
    if (process.env.NOVA_TEST_GENERATION === "failure") {
      assert.equal(final.type, "error");
      assert.equal(final.credits, 100);
      assert.match(final.error, /restored/);
      assert.equal((await (await request("/api/me")).json()).user.credits, 100);
      assert.equal(
        (await (await request("/api/generations?scope=mine")).json())
          .generations.length,
        0,
      );
    } else {
      assert.equal(final.type, "complete", final.error);
      assert.equal(final.credits, 95);
      assert.equal((await (await request("/api/me")).json()).user.credits, 95);
      const mine = (await (await request("/api/generations?scope=mine")).json())
        .generations;
      assert.equal(mine.length, 1);
      assert.equal(mine[0].id, final.generation.id);
      const image = await fetch(final.generation.image_url);
      assert.equal(image.status, 200);
      assert.match(image.headers.get("content-type"), /^image\//);
    }
    assert.equal((await events.next()).done, true);
  },
);
