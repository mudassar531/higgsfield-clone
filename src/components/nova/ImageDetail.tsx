"use client";

import { useEffect, useRef, useState } from "react";
import NovaImage from "@/components/nova/NovaImage";
import { frameMeta, modelLabel } from "@/lib/options";
import { editorialTitle } from "@/lib/editorial-art";
import type { GenerationLike } from "@/lib/types";

export default function ImageDetail({
  image,
  source,
  origin,
  onClose,
  onUse,
}: {
  image: GenerationLike;
  source: "room" | "yours";
  origin: DOMRect | null;
  onClose: () => void;
  onUse: (image: GenerationLike) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const frame = frameMeta(image.aspect_ratio);
  useEffect(() => {
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal?.showModal();
    if (
      panel.current &&
      !origin &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      panel.current.animate(
        [
          { opacity: 0, transform: "scale(.94)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 500, easing: "cubic-bezier(.2,.78,.2,1)" },
      );
    }
    if (
      origin &&
      panel.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const destination = panel.current.getBoundingClientRect();
      const dx =
        origin.left +
        origin.width / 2 -
        (destination.left + destination.width / 2);
      const dy =
        origin.top +
        origin.height / 2 -
        (destination.top + destination.height / 2);
      panel.current.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${Math.max(0.1, origin.width / destination.width)}, ${Math.max(0.1, origin.height / destination.height)})`,
            opacity: 0.7,
          },
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
        ],
        { duration: 620, easing: "cubic-bezier(.2,.78,.2,1)" },
      );
    }
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [origin]);
  function closeWithMotion() {
    if (closing.current) return;
    closing.current = true;
    if (
      !panel.current ||
      !origin ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onClose();
      return;
    }
    const destination = panel.current.getBoundingClientRect();
    const dx =
      origin.left +
      origin.width / 2 -
      (destination.left + destination.width / 2);
    const dy =
      origin.top +
      origin.height / 2 -
      (destination.top + destination.height / 2);
    panel.current
      .animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          {
            transform: `translate(${dx}px, ${dy}px) scale(${Math.max(0.1, origin.width / destination.width)}, ${Math.max(0.1, origin.height / destination.height)})`,
            opacity: 0.5,
          },
        ],
        { duration: 360, easing: "cubic-bezier(.6,0,.82,.2)" },
      )
      .finished.then(onClose)
      .catch(onClose);
  }
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
      onCancel={(event) => {
        event.preventDefault();
        closeWithMotion();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeWithMotion();
      }}
      aria-labelledby="image-detail-title"
    >
      <div className="detail-dialog" ref={panel}>
        <button
          className="detail-close"
          type="button"
          aria-label="Close image details"
          onClick={closeWithMotion}
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
            {image.id.startsWith("editorial-")
              ? "Nova study · Original AI editorial artwork"
              : image.id.startsWith("seed-")
                ? "From the starter collection"
                : source === "yours"
                  ? "From your collection"
                  : "From the community"}
          </p>
          <h2 id="image-detail-title" className="detail-title">
            {editorialTitle(image) ??
              (source === "yours" ? "You made this." : "Make it your own.")}
          </h2>
          <p className="detail-label">The prompt</p>
          <p className="detail-prompt">{image.prompt}</p>
          <div className="detail-facts">
            <span>
              {image.id.startsWith("editorial-")
                ? "Editorial study"
                : modelLabel(image.model)}
            </span>
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
