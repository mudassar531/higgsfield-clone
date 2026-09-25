"use client";

import { useAccount } from "@/components/nova/account";
import NovaImage from "@/components/nova/NovaImage";
import { frameMeta, modelLabel } from "@/lib/options";
import type { GenerationLike } from "@/lib/types";
import Link from "next/link";

export default function InspirationRail({
  room,
  mine,
  mineReady,
  tab,
  setTab,
  activeId,
  onPick,
}: {
  room: GenerationLike[];
  mine: GenerationLike[];
  mineReady: boolean;
  tab: "room" | "yours";
  setTab: (tab: "room" | "yours") => void;
  activeId: string | null;
  onPick: (generation: GenerationLike, source: "room" | "yours") => void;
}) {
  const { user, ready } = useAccount();
  const items = tab === "yours" ? mine : room;

  return (
    <section id="explore" tabIndex={-1} className="gallery-col outline-none" aria-label="Explore">
      <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3">
        <h2 className="text-sm font-medium">Explore</h2>
        <div className="mt-2 flex gap-4" role="tablist" aria-label="Gallery">
          <Tab selected={tab === "room"} onClick={() => setTab("room")}>
            The room
          </Tab>
          <Tab selected={tab === "yours"} onClick={() => setTab("yours")}>
            Yours
          </Tab>
        </div>
      </div>

      <div className="p-3" role="tabpanel">
        {tab === "yours" && ready && !user ? (
          <div className="px-1 py-6">
            <p className="text-sm text-muted">Sign in to see the images you make.</p>
            <Link href="/login?next=/" className="mt-3 inline-block text-sm text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </div>
        ) : tab === "yours" && !mineReady ? (
          <div className="grid grid-cols-2 gap-2" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-28 bg-background" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-1 py-6 text-sm text-muted">Images you make will show up here.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((generation) => (
              <GenerationThumb
                key={generation.id}
                generation={generation}
                selected={generation.id === activeId}
                onPick={() => onPick(generation, tab)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Tab({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`border-b pb-1 text-sm ${
        selected ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function GenerationThumb({
  generation,
  selected,
  onPick,
}: {
  generation: GenerationLike;
  selected: boolean;
  onPick: () => void;
}) {
  const frame = frameMeta(generation.aspect_ratio);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={generation.prompt}
      title={generation.prompt}
      className={`group relative block w-full overflow-hidden rounded-[10px] bg-background text-left ${
        selected ? "outline outline-2 outline-offset-2 outline-accent" : ""
      }`}
    >
      <NovaImage
        src={generation.image_url}
        alt=""
        width={frame.width}
        height={frame.height}
        sizes="(min-width: 1100px) 160px, 45vw"
        className="h-auto w-full"
      />
      <span className="pointer-events-none absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-2 bg-surface/95 px-1.5 py-1 text-[10px] text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="truncate font-mono">
          {modelLabel(generation.model)} · {frame.label}
        </span>
        <span className="shrink-0 text-accent">Use brief</span>
      </span>
    </button>
  );
}
