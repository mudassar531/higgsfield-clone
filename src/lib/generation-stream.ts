import type { GenerationLike } from "./types";

export type GenerationEvent =
  | { type: "reserved"; credits: number; cost: number }
  | { type: "complete"; generation: GenerationLike; credits: number }
  | { type: "error"; error: string; credits?: number };

/** Network chunks can split anywhere, including in the middle of a UTF-8 character. */
export async function* readGenerationEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      const lines = pending.split("\n");
      pending = lines.pop()!;
      for (const line of lines) {
        if (line.trim()) yield JSON.parse(line) as GenerationEvent;
      }
      if (done) {
        if (pending.trim()) yield JSON.parse(pending) as GenerationEvent;
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
