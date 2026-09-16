"use client";

import { useEffect, useState } from "react";
import GenerationCard, { type GenerationLike } from "@/components/GenerationCard";

const MODELS = [
  { id: "flux", label: "Nova Flux", credits: 5 },
  { id: "flux-realism", label: "Nova Realism", credits: 5 },
  { id: "flux-anime", label: "Nova Anime", credits: 5 },
] as const;

const ASPECTS = ["1:1", "3:4", "16:9"] as const;

export default function CreateStudio() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<(typeof MODELS)[number]["id"]>("flux");
  const [aspect, setAspect] = useState<(typeof ASPECTS)[number]>("1:1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<GenerationLike | null>(null);
  const [mine, setMine] = useState<GenerationLike[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);

  useEffect(() => {
    fetch("/api/generations?scope=mine")
      .then((r) => r.json())
      .then((d) => setMine(d.generations ?? []))
      .finally(() => setLoadingMine(false));
  }, []);

  const cost = MODELS.find((m) => m.id === model)?.credits ?? 5;

  async function onGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), model, aspectRatio: aspect }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        return;
      }
      setLatest(data.generation);
      setMine((prev) => [data.generation, ...prev]);
      window.dispatchEvent(new Event("nova:refresh-me"));
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Describe the scene you imagine
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              maxLength={800}
              placeholder="a lighthouse on a cliff during a meteor shower, cinematic lighting"
              className="w-full resize-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Model
            </label>
            <div className="flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    model === m.id
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Aspect ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {ASPECTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAspect(a)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    aspect === a
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            onClick={onGenerate}
            disabled={loading || !prompt.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? (
              "Generating…"
            ) : (
              <>
                Generate <span className="opacity-70">· ✦ {cost}</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-surface p-4">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-muted">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
                <p className="text-sm">Rendering your image…</p>
              </div>
            ) : latest ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latest.image_url}
                alt={latest.prompt}
                className="max-h-[520px] rounded-xl object-contain"
              />
            ) : (
              <p className="text-sm text-muted">
                Your generated image will appear here.
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
              Your generations
            </h2>
            {loadingMine ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : mine.length === 0 ? (
              <p className="text-sm text-muted">
                Nothing yet — generate your first image above.
              </p>
            ) : (
              <div className="masonry">
                {mine.map((g) => (
                  <GenerationCard key={g.id} generation={g} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
