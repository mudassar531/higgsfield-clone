"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Mark from "@/components/nova/Mark";

export default function AuthForm({ mode }: { mode: "login" | "sign-up" }) {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";
  const next = params.get("next");
  const switchHref = `${isLogin ? "/sign-up" : "/login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      // Full load so the new session cookie is visible to server components.
      window.location.href = params.get("next") ?? "/";
    } catch {
      setError("Network error — try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
      <div className="relative hidden min-h-dvh lg:block">
        <Image
          src="/seed/5.jpg"
          alt=""
          fill
          priority
          sizes="58vw"
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground" aria-label="Nova">
            <Mark />
            <span className="text-[15px] font-medium tracking-tight">Nova</span>
          </Link>
          <h1 className="mt-8 text-3xl tracking-tight">{isLogin ? "Log in" : "Create an account"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {isLogin
              ? "Your images and credits are on this account."
              : "100 credits. 5 for each image."}
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="press mt-6 min-h-11 w-full rounded-lg bg-accent text-sm font-medium text-accent-foreground disabled:opacity-40"
          >
            {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>

          <p className="mt-5 text-sm text-muted">
            {isLogin ? "New to Nova?" : "Already have an account?"}{" "}
            <Link href={switchHref} className="text-foreground underline underline-offset-4">
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
