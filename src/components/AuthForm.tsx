"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AuthForm({ mode }: { mode: "login" | "sign-up" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

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
      router.push(params.get("next") ?? "/create");
      router.refresh();
    } catch {
      setError("Network error — try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-black uppercase tracking-tight">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isLogin
          ? "Log in to keep generating."
          : "Sign up and get 100 free credits."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent px-4 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "New to Nova?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/sign-up" : "/login"}
          className="font-semibold text-foreground underline underline-offset-2"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
