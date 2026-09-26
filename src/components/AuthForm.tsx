"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Workspace from "@/components/nova/Workspace";

function safeDestination(value: string | null) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/";
}

export default function AuthForm({ mode }: { mode: "login" | "sign-up" }) {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";
  const next = safeDestination(params.get("next"));
  const switchHref = `${isLogin ? "/sign-up" : "/login"}?next=${encodeURIComponent(next)}`;
  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
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
        setError(data.error ?? "We couldn't sign you in. Please try again.");
        setLoading(false);
        return;
      }
      window.location.assign(next);
    } catch {
      setError(
        "We couldn't reach the studio. Please check your connection and try again.",
      );
      setLoading(false);
    }
  }
  return (
    <Workspace>
      <div className="auth-layout">
        <div className="auth-visual">
          <Image
            src="/art/bloom.webp"
            alt="An oversized orange poppy in a chrome vase against a pink background"
            fill
            preload
            sizes="(max-width: 650px) 100vw, 50vw"
          />
          <div className="auth-visual-copy">
            <p>A little room for big ideas.</p>
            <h2>
              Your next idea
              <br />
              looks good on you.
            </h2>
          </div>
        </div>
        <div className="auth-panel">
          <form className="auth-form" onSubmit={onSubmit}>
            <Link className="auth-back" href="/">
              ← Back to the studio
            </Link>
            <p className="section-kicker">
              {isLogin ? "Good to see you again" : "Make yourself at home"}
            </p>
            <h1 className="auth-heading">
              {isLogin ? "Welcome back." : "Let’s make something."}
            </h1>
            <p className="auth-subheading">
              {isLogin
                ? "Your ideas, images, and happy accidents are waiting."
                : "Start with 100 free credits. That’s 20 chances to surprise yourself. No card required."}
            </p>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">
                Password
                {!isLogin && (
                  <span className="auth-password-help">
                    {" "}
                    · At least 8 characters
                  </span>
                )}
              </label>
              <div className="auth-password-row">
                <input
                  id="password"
                  name="password"
                  type={visible ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                >
                  {visible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="generate-button auth-submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? "Opening your studio…"
                : isLogin
                  ? "Log in to your studio"
                  : "Create your free account"}
              <span aria-hidden>↗</span>
            </button>
            <p className="auth-switch">
              {isLogin
                ? "New around here?"
                : "Already have a little world here?"}{" "}
              <Link href={switchHref}>
                {isLogin ? "Create an account" : "Log in"}
              </Link>
            </p>
            <p className="auth-sharing-note">
              Images you create appear in the community gallery. Keep personal
              information out of your prompts.
            </p>
          </form>
        </div>
      </div>
    </Workspace>
  );
}
