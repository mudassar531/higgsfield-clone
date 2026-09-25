"use client";

import { useEffect, useRef, useState } from "react";
import NovaImage from "@/components/nova/NovaImage";
import { frameMeta, modelLabel } from "@/lib/options";
import type { GenerationLike } from "@/lib/types";

export default function ImageDetail({
  image,
  source,
  onClose,
  onUse,
}: {
  image: GenerationLike;
  source: "room" | "yours";
  onClose: () => void;
  onUse: (image: GenerationLike) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const frame = frameMeta(image.aspect_ratio);
  useEffect(() => {
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal?.showModal();
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="image-dialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="image-detail-title"
    >
      <div className="detail-dialog">
        <button
          className="detail-close"
          type="button"
          aria-label="Close image details"
          onClick={onClose}
        >
          <span aria-hidden>×</span>
        </button>
        <div className="detail-image-wrap">
          <NovaImage
            src={image.image_url}
            alt={image.prompt}
            width={frame.width}
            height={frame.height}
            sizes="(max-width: 650px) 95vw, 60vw"
            priority
          />
        </div>
        <div className="detail-info">
          <p className="detail-owner">
            {image.id.startsWith("seed-")
              ? "From the starter collection"
              : source === "yours"
                ? "From your collection"
                : "From the community"}
          </p>
          <h2 id="image-detail-title" className="detail-title">
            {source === "yours"
              ? "A little idea. Made real."
              : "Every image starts somewhere."}
          </h2>
          <p className="detail-label">The prompt</p>
          <p className="detail-prompt">{image.prompt}</p>
          <div className="detail-facts">
            <span>{modelLabel(image.model)}</span>
            <span>
              {frame.label} · {image.aspect_ratio}
            </span>
          </div>
          <p className="detail-hint">
            Take this prompt in a new direction. Change the scene, the mood, or
            one small detail.
          </p>
          {copyError && (
            <p className="detail-hint" role="status">
              Select and copy the prompt above. Clipboard access isn’t available
              in this browser.
            </p>
          )}
          <div className="detail-actions">
            <button
              className="generate-button"
              type="button"
              onClick={() => onUse(image)}
            >
              Use this prompt <span aria-hidden>↗</span>
            </button>
            <button
              className="detail-secondary"
              type="button"
              onClick={() => void copyPrompt()}
            >
              {copied ? "Copied ✓" : "Copy prompt"}
            </button>
            <a
              className="detail-open"
              href={image.image_url}
              target="_blank"
              rel="noreferrer"
            >
              Open original image ↗
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
