import Link from "next/link";
import GenerationCard from "@/components/GenerationCard";
import { getExploreFeed } from "@/lib/feed";

export const revalidate = 0;

export default async function ExplorePage() {
  const feed = await getExploreFeed();

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
          <span className="text-accent">✦</span> AI-native creative studio
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl">
          Describe it. <span className="text-accent">Watch it</span> come to life.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          Nova turns a text prompt into a finished image in seconds. Browse what
          the community is making below, or start your own.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/create"
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-95"
          >
            Start creating — it&apos;s free
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Explore
          </h2>
          <span className="text-xs text-muted">{feed.length} generations</span>
        </div>
        <div className="masonry">
          {feed.map((g) => (
            <GenerationCard key={g.id} generation={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
