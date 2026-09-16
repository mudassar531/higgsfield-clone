"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { id: string; email: string; credits: number } | null;

const LINKS = [
  { href: "/", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/pricing", label: "Pricing" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch("/api/me")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setMe(data.user);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    load();
    window.addEventListener("nova:refresh-me", load);
    return () => {
      cancelled = true;
      window.removeEventListener("nova:refresh-me", load);
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard navigation on purpose — see AuthForm's onSubmit for why.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-black text-lg">
            ✦
          </span>
          <span className="text-lg font-black tracking-tight">NOVA</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-surface" />
          ) : me ? (
            <>
              <span className="hidden rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted sm:inline-flex items-center gap-1">
                <span className="text-accent">✦</span>
                {me.credits} credits
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:brightness-95 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
