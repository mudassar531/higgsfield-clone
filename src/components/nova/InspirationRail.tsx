"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useAccount } from "@/components/nova/account";
import NovaImage from "@/components/nova/NovaImage";
import { frameMeta, modelLabel } from "@/lib/options";
import type { GenerationLike } from "@/lib/types";

export default function InspirationRail({
  room,
  mine,
  mineReady,
  mineError,
  tab,
  setTab,
  onPick,
}: {
  room: GenerationLike[];
  mine: GenerationLike[];
  mineReady: boolean;
  mineError: string | null;
  tab: "room" | "yours";
  setTab: (tab: "room" | "yours") => void;
  onPick: (generation: GenerationLike, source: "room" | "yours", origin: DOMRect) => void;
}) {
  const { user, ready } = useAccount();
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("all");
  const [activeColor, setActiveColor] = useState("#aab59e");
  const source = tab === "yours" ? mine : room;
  const items = source.filter(
    (item) =>
      (style === "all" || item.model === style) &&
      item.prompt.toLowerCase().includes(search.trim().toLowerCase()),
  );
  function changeTab(next: "room" | "yours") {
    setTab(next);
    setSearch("");
    setStyle("all");
  }
  return (
    <section
      id="explore"
      tabIndex={-1}
      className="gallery-section"
      aria-labelledby="gallery-title"
      style={{ "--gallery-glow": activeColor } as CSSProperties}
    >
      <div className="gallery-intro">
        <div>
          <p className="section-kicker">
            {tab === "yours"
              ? "YOUR PERSONAL COLLECTION"
              : "THE COMMUNITY CANVAS"}
          </p>
          <h2 id="gallery-title" className="gallery-heading">
            {tab === "yours" ? (
              <>
                Made by <em>you.</em>
              </>
            ) : (
              <>
                A spark for your <em>next idea.</em>
              </>
            )}
          </h2>
          <p className="gallery-subtitle">
            {tab === "yours"
              ? "Every experiment, unexpected turn, and happy accident. All here."
              : "Different minds. Endless possibilities. Find a prompt and make it your own."}
          </p>
        </div>
        <div
          className="gallery-tabs"
          role="tablist"
          aria-label="Image collection"
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? "room"
                : event.key === "End"
                  ? "yours"
                  : tab === "room"
                    ? "yours"
                    : "room";
            changeTab(next);
            document
              .getElementById(
                next === "room" ? "community-tab" : "personal-tab",
              )
              ?.focus();
          }}
        >
          <button
            id="community-tab"
            className="gallery-tab"
            role="tab"
            tabIndex={tab === "room" ? 0 : -1}
            aria-selected={tab === "room"}
            aria-controls="gallery-panel"
            onClick={() => changeTab("room")}
          >
            Explore
          </button>
          <button
            id="personal-tab"
            className="gallery-tab"
            role="tab"
            tabIndex={tab === "yours" ? 0 : -1}
            aria-selected={tab === "yours"}
            aria-controls="gallery-panel"
            onClick={() => changeTab("yours")}
          >
            My creations
          </button>
        </div>
      </div>
      <div className="gallery-filter-bar">
        <div className="gallery-filters" aria-label="Filter by image style">
          {[
            { value: "all", label: "All images" },
            { value: "flux", label: "Imaginative" },
            { value: "flux-realism", label: "Photographic" },
            { value: "flux-anime", label: "Illustrated" },
          ].map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setStyle(option.value)}
              aria-pressed={style === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="gallery-search-wrap">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle
              cx="8.5"
              cy="8.5"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="sr-only">Search image prompts</span>
          <input
            type="search"
            className="gallery-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a little inspiration…"
          />
        </label>
      </div>
      <div
        id="gallery-panel"
        role="tabpanel"
        aria-labelledby={tab === "room" ? "community-tab" : "personal-tab"}
      >
        {tab === "yours" && ready && !user ? (
          <div className="gallery-empty">
            <p>Your next great idea deserves a home.</p>
            <p>Sign in to see the images you create.</p>
            <Link href="/login?next=%2F%23yours">Sign in to your studio ↗</Link>
          </div>
        ) : tab === "yours" && (!ready || !mineReady) ? (
          <div
            className="gallery-skeleton"
            role="status"
            aria-label="Loading your images"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} />
            ))}
          </div>
        ) : tab === "yours" && mineError ? (
          <div className="gallery-empty" role="alert">
            <p>{mineError}</p>
            <button
              className="detail-secondary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="gallery-empty">
            <p>
              {search || style !== "all"
                ? "No images match just yet. Try another search or style."
                : "A blank canvas is a good place to start."}
            </p>
            {search || style !== "all" ? (
              <button
                className="detail-secondary"
                onClick={() => {
                  setSearch("");
                  setStyle("all");
                }}
              >
                Clear filters
              </button>
            ) : (
              <a href="#prompt">Make your first image ↗</a>
            )}
          </div>
        ) : (
          <div className="gallery-grid">
            {items.map((generation, index) => {
              const frame = frameMeta(generation.aspect_ratio);
              return (
                <button
                  key={generation.id}
                  type="button"
                  className="gallery-card"
                  onClick={(event) => onPick(generation, tab, event.currentTarget.getBoundingClientRect())}
                  onMouseEnter={() => setActiveColor(["#bb8c6e", "#8da99a", "#999cad", "#c5a180"][index % 4])}
                  onFocus={() => setActiveColor(["#bb8c6e", "#8da99a", "#999cad", "#c5a180"][index % 4])}
                  aria-label={`View image: ${generation.prompt}`}
                >
                  <span className="gallery-card-media">
                    <NovaImage
                      src={generation.image_url}
                      alt={generation.prompt}
                      width={frame.width}
                      height={frame.height}
                      sizes="(max-width: 650px) 46vw, (max-width: 1000px) 30vw, 23vw"
                    />
                    <span className="card-view">
                      View prompt <span aria-hidden>↗</span>
                    </span>
                  </span>
                  <span className="gallery-card-info">
                    <span className="gallery-card-prompt">
                      {generation.prompt}
                    </span>
                    <span className="gallery-card-meta">
                      <span>{modelLabel(generation.model)}</span>
                      <span className="gallery-badge">
                        {generation.id.startsWith("seed-")
                          ? "Starter"
                          : tab === "yours"
                            ? "Yours"
                            : "Community"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <footer className="gallery-footer">
        <span>Made of imagination. Made with Nova.</span>
        <span>
          Starter artworks are curated examples. Community images are created
          here.
        </span>
        <Link href="/pricing">100 credits to begin. A world to explore. ↗</Link>
      </footer>
    </section>
  );
}
