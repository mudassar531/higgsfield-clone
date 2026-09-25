"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useAccount } from "@/components/nova/account";
import { FRAMES, MODELS, type FrameId, type ModelId } from "@/lib/options";

export default function PromptComposer({
  prompt,
  setPrompt,
  model,
  setModel,
  aspect,
  setAspect,
  loading,
  error,
  notice,
  inspiration,
  onClearInspiration,
  onGenerate,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  model: ModelId;
  setModel: (value: ModelId) => void;
  aspect: FrameId;
  setAspect: (value: FrameId) => void;
  loading: boolean;
  error: string | null;
  notice: string | null;
  inspiration: string | null;
  onClearInspiration: () => void;
  onGenerate: () => void;
}) {
  const { user, ready } = useAccount();
  const signedIn = user !== null;
  const outOfCredits = signedIn && user.credits < 5;
  const promptId = "prompt";

  function onKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onGenerate();
    }
  }

  const label = !ready
    ? "Generate · 5 credits"
    : loading
      ? "Creating image…"
      : !signedIn
        ? "Sign in to generate"
        : outOfCredits
          ? "Not enough credits"
          : "Generate · 5 credits";

  return (
    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="border border-border bg-surface shadow-[0_8px_30px_rgba(23,23,23,0.04)] sm:rounded-2xl">
        <div className="px-3 pt-3 sm:px-4">
          {inspiration && (
            <p className="mb-2 flex items-center gap-3 text-sm text-muted">
              <span>{inspiration}</span>
              <button type="button" className="text-foreground underline-offset-4 hover:underline" onClick={onClearInspiration}>
                Clear
              </button>
            </p>
          )}
          {notice && !error && <p className="mb-2 text-sm text-muted">{notice}</p>}
          <div aria-live="polite">
            {error && <p className="mb-2 text-sm text-danger">{error}</p>}
            {loading && !error && <p className="mb-2 text-sm text-muted">Creating image…</p>}
          </div>
        </div>

        <div className="relative px-3 sm:px-4">
          <label htmlFor={promptId} className="sr-only">
            Prompt
          </label>
          <textarea
            id={promptId}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            maxLength={800}
            placeholder="Describe the image you want to make…"
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted/80"
          />
          {prompt.length > 640 && (
            <p className="pb-1 text-right font-mono text-[11px] text-muted">{800 - prompt.length}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-3 py-3 sm:flex-row sm:items-center sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <ModelMenu model={model} setModel={setModel} />
            <FramePicker aspect={aspect} setAspect={setAspect} />
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            {ready && signedIn && (
              <span className="font-mono text-[11px] text-muted">{user.credits} left</span>
            )}
            <span className="font-mono text-[11px] text-muted">⌘/Ctrl ↵</span>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!ready || loading || outOfCredits}
              aria-busy={loading}
              className="press min-h-11 flex-1 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground disabled:opacity-40 sm:flex-none"
            >
              {label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelMenu({ model, setModel }: { model: ModelId; setModel: (value: ModelId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = MODELS.find((item) => item.id === model) ?? MODELS[0];

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        {current.label}
      </button>
      {open && (
        <ul id={listId} role="listbox" className="absolute bottom-full left-0 z-20 mb-2 w-64 border border-border bg-surface p-1 shadow-[0_8px_30px_rgba(23,23,23,0.06)]">
          {MODELS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === model}
                className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-background"
                onClick={() => {
                  setModel(item.id);
                  setOpen(false);
                }}
              >
                <span className="text-sm">{item.label}</span>
                <span className="text-xs text-muted">{item.note}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FramePicker({ aspect, setAspect }: { aspect: FrameId; setAspect: (value: FrameId) => void }) {
  return (
    <div className="flex" role="radiogroup" aria-label="Frame">
      {FRAMES.map((frame) => {
        const selected = frame.id === aspect;
        return (
          <button
            key={frame.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setAspect(frame.id)}
            className={`flex min-h-11 items-center gap-2 border px-2.5 text-sm ${
              selected ? "border-accent text-accent" : "border-border text-muted hover:text-foreground"
            } ${frame.id === "1:1" ? "rounded-l-lg" : "-ml-px"} ${frame.id === "16:9" ? "rounded-r-lg" : ""}`}
          >
            <FrameGlyph id={frame.id} />
            {frame.label}
          </button>
        );
      })}
    </div>
  );
}

function FrameGlyph({ id }: { id: FrameId }) {
  const box = id === "3:4" ? "h-3.5 w-2.5" : id === "16:9" ? "h-2 w-3.5" : "h-3 w-3";
  return <span className={`inline-block border border-current ${box}`} aria-hidden />;
}
