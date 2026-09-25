"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Mark from "@/components/nova/Mark";
import { useAccount } from "@/components/nova/account";

export function SiteHeader({
  overlay = false,
  onGallery,
  onBeforeAuth,
}: {
  overlay?: boolean;
  onGallery?: (tab: "room" | "yours") => void;
  onBeforeAuth?: () => void;
}) {
  const { user, ready } = useAccount();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent) {
      if (!account.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  async function logout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      // A document reload ensures the cleared session cookie is used everywhere.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    } catch {
      setLogoutError(true);
    }
  }
  return (
    <header className={`site-header ${overlay ? "" : "site-header-solid"}`}>
      <div className="site-header-inner">
        <Link href="/" className="wordmark" aria-label="Nova home">
          <Mark className="wordmark-flower h-7 w-7" />
          <span className="wordmark-name">nova</span>
          <span className="wordmark-studio">STUDIO</span>
        </Link>
        <nav className="site-links" aria-label="Primary navigation">
          <Link
            className="site-link"
            href="/#explore"
            onClick={
              onGallery
                ? (event) => {
                    event.preventDefault();
                    onGallery("room");
                  }
                : undefined
            }
          >
            Explore
          </Link>
          <Link
            className="site-link"
            href="/#yours"
            onClick={
              onGallery
                ? (event) => {
                    event.preventDefault();
                    onGallery("yours");
                  }
                : undefined
            }
          >
            My creations
          </Link>
          <Link className="site-link" href="/pricing">
            How it works
          </Link>
        </nav>
        <div className="site-actions">
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span aria-hidden>{mobileOpen ? "×" : "☰"}</span>
          </button>
          {ready && user ? (
            <>
              <Link className="header-credits" href="/pricing">
                <span aria-hidden>✧</span> {user.credits} credits
              </Link>
              <div className="header-user" ref={account}>
                <button
                  className="header-avatar"
                  type="button"
                  aria-label="Account"
                  aria-expanded={open}
                  onClick={() => setOpen(!open)}
                >
                  {user.email[0].toUpperCase()}
                </button>
                {open && (
                  <div className="account-popover">
                    <p>{user.email}</p>
                    <Link href="/#yours" onClick={() => setOpen(false)}>
                      My creations
                    </Link>
                    <button onClick={() => void logout()}>Sign out</button>
                    {logoutError && (
                      <p role="alert">Could not sign out. Please retry.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login?next=/"
                className="header-login-text"
                onClick={onBeforeAuth}
              >
                Log in
              </Link>
              <Link
                href="/sign-up?next=/"
                className="header-signup"
                onClick={onBeforeAuth}
              >
                Start creating <span aria-hidden>↗</span>
              </Link>
            </>
          )}
        </div>
      </div>
      {mobileOpen && (
        <nav
          className="mobile-navigation"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          <Link
            href="/#explore"
            onClick={
              onGallery
                ? (event) => {
                    event.preventDefault();
                    setMobileOpen(false);
                    onGallery("room");
                  }
                : () => setMobileOpen(false)
            }
          >
            Explore images <span aria-hidden>↗</span>
          </Link>
          <Link
            href="/#yours"
            onClick={
              onGallery
                ? (event) => {
                    event.preventDefault();
                    setMobileOpen(false);
                    onGallery("yours");
                  }
                : () => setMobileOpen(false)
            }
          >
            My creations <span aria-hidden>↗</span>
          </Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)}>
            Credits & how it works <span aria-hidden>↗</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
