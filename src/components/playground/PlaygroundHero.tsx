"use client";

import { useRef, type ReactNode } from "react";
import NovaImage from "@/components/nova/NovaImage";
import { EDITORIAL_ART } from "@/lib/editorial-art";
import type { GenerationLike } from "@/lib/types";
import { usePlaygroundMotion } from "./usePlaygroundMotion";

export default function PlaygroundHero({
  children,
  activeIdea,
  loading,
  onPick,
}: {
  children: ReactNode;
  activeIdea: number;
  loading: boolean;
  onPick: (image: GenerationLike, origin: DOMRect) => void;
}) {
  const root = useRef<HTMLElement>(null);
  usePlaygroundMotion(root);
  return (
    <section
      ref={root}
      className="studio-hero playground-hero"
      data-idea={activeIdea}
      data-generating={loading}
      aria-labelledby="studio-title"
    >
      <div className="playground-stage">
        <div className="hero-word" aria-hidden="true">
          {"nova".split("").map((letter, index) => (
            <span className="hero-letter-mask" key={index}>
              <span className="hero-letter">{letter}</span>
            </span>
          ))}
        </div>
        <span className="playground-note">
          Your imagination.
          <br />
          Out in the world.
        </span>
        <span className="idea-sticker" aria-hidden="true">
          what
          <br />
          if?
        </span>
        <div className="hero-artworks">
          {EDITORIAL_ART.map((art, index) => (
            <div
              key={art.id}
              className={`artwork-flight artwork-flight-${index + 1}`}
              data-artwork={art.id}
            >
              <div className="print-parallax">
                <button
                  type="button"
                  className="hero-print"
                  onClick={(event) =>
                    onPick(art, event.currentTarget.getBoundingClientRect())
                  }
                  aria-label={`Explore ${art.title}`}
                >
                  <span className="print-surface">
                    <NovaImage
                      src={art.image_url}
                      alt={art.title}
                      width={index === 1 ? 1200 : 900}
                      height={index === 0 ? 1200 : 900}
                      sizes="(max-width: 650px) 40vw, 28vw"
                      priority
                    />
                    <span className="print-caption">
                      {art.title}
                      <span aria-hidden>+</span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="playground-message">
        <h1 id="studio-title">Go on. Make something up.</h1>
        <p>Turn a few words into an image only you could imagine.</p>
      </div>
      <div className="hero-composer-wrap">
        <div className="composer-stack">{children}</div>
      </div>
      <div className="hero-footnote">
        <span>100 free credits. All yours to play with.</span>
        <a href="#explore">
          Keep exploring <span aria-hidden>↓</span>
        </a>
      </div>
    </section>
  );
}
