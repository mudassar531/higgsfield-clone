"use client";

import type { KeyboardEvent } from "react";
import { useAccount } from "@/components/nova/account";
import {
  FRAMES,
  MODELS,
  GENERATION_COST,
  type FrameId,
  type ModelId,
} from "@/lib/options";
import Mark from "@/components/nova/Mark";

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
  const outOfCredits = !!user && user.credits < GENERATION_COST;
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onGenerate();
    }
  }
  return (
    <div className={`prompt-card ${loading ? "is-generating" : ""}`}>
      <div className="prompt-card-main">
        <div className="prompt-topline">
          <label htmlFor="prompt">Your next image starts here</label>
          <span className="prompt-tip">
            {prompt.length > 0
              ? `${prompt.length}/800`
              : "Text to image"}
          </span>
        </div>
        {inspiration && (
          <div className="reference-notice">
            <span>↳ {inspiration}</span>
            <button type="button" onClick={onClearInspiration}>
              Clear reference ×
            </button>
          </div>
        )}
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={onKeyDown}
          maxLength={800}
          rows={2}
          disabled={loading}
          placeholder="A cloud with somewhere to be…"
          className="prompt-textarea"
          aria-describedby={error ? "prompt-error" : undefined}
        />
      </div>
      {(error || notice || loading) && (
        <div className="prompt-message" aria-live="polite">
          {error ? (
            <p id="prompt-error" className="prompt-message-error" role="alert">
              {error}
            </p>
          ) : loading ? (
            <p className="prompt-message-loading">
              <span className="loading-dot" aria-hidden />
              {notice ?? "Starting your image…"}
            </p>
          ) : (
            <p className="prompt-message-notice">{notice}</p>
          )}
        </div>
      )}
      <div className="prompt-controls">
        <span className="prompt-control-label">
          <Mark className="h-4 w-4" /> Image studio
        </span>
        <label>
          <span className="sr-only">Image style</span>
          <select
            value={model}
            onChange={(event) => setModel(event.target.value as ModelId)}
            disabled={loading}
          >
            {MODELS.map((option) => (
              <option value={option.id} key={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Image format</span>
          <select
            value={aspect}
            onChange={(event) => setAspect(event.target.value as FrameId)}
            disabled={loading}
          >
            {FRAMES.map((option) => (
              <option value={option.id} key={option.id}>
                {option.id} · {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="prompt-control-spacer" />
        <span className="prompt-cost">
          <span>✧ {GENERATION_COST} credits / image</span>
          {user && (
            <span className="prompt-balance" aria-live="polite">
              {user.credits} credits left
            </span>
          )}
        </span>
        <button
          className="generate-button"
          type="button"
          onClick={onGenerate}
          disabled={!ready || loading || outOfCredits}
          aria-busy={loading}
        >
          {loading
            ? "Creating…"
            : outOfCredits
              ? "No credits left"
              : !user && ready
                ? "Sign in to create"
                : "Generate image"}
          <span aria-hidden>{loading ? "" : "↗"}</span>
        </button>
      </div>
    </div>
  );
}
