import assert from "node:assert/strict";
import { test } from "node:test";
import { readGenerationEvents } from "../src/lib/generation-stream.ts";

function stream(chunks) {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

test("credit and refund events survive arbitrary byte boundaries and Unicode", async () => {
  const expected = [
    { type: "reserved", credits: 95, cost: 5 },
    {
      type: "error",
      credits: 100,
      error: "Couldn’t create this image — refunded.",
    },
  ];
  const bytes = new TextEncoder().encode(
    expected.map((event) => JSON.stringify(event)).join("\n"),
  );
  const actual = [];
  for await (const event of readGenerationEvents(
    stream([...bytes].map((byte) => new Uint8Array([byte]))),
  ))
    actual.push(event);
  assert.deepEqual(actual, expected);
});

test("reservation is available before the final image result", async () => {
  let controller;
  const source = new ReadableStream({
    start(value) {
      controller = value;
    },
  });
  const events = readGenerationEvents(source);
  controller.enqueue(
    new TextEncoder().encode('{"type":"reserved","credits":95,"cost":5}\n'),
  );
  assert.equal((await events.next()).value.credits, 95);
  controller.enqueue(
    new TextEncoder().encode(
      '{"type":"error","credits":100,"error":"Refunded"}\n',
    ),
  );
  controller.close();
  assert.equal((await events.next()).value.credits, 100);
  assert.equal((await events.next()).done, true);
});
