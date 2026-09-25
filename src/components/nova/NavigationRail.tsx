"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Mark from "@/components/nova/Mark";
import { useAccount } from "@/components/nova/account";

function IconCreate() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconExplore() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="4" y="4" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function UserMenu({ placement }: { placement: "rail" | "header" }) {
  const { user, ready } = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Full load so the cleared cookie is what the next document reads.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  }

  if (!ready) {
    return <span className="h-8 w-8 bg-background" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted hover:bg-background hover:text-foreground"
        aria-label="Sign in"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <circle cx="12" cy="9" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6.5 19.25c1.2-2.4 3.1-3.5 5.5-3.5s4.3 1.1 5.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </Link>
    );
  }

  const initial = user.email.slice(0, 1).toUpperCase();
  const menuClass =
    placement === "rail"
      ? "absolute bottom-0 left-full z-30 ml-2 w-56"
      : "absolute right-0 top-full z-30 mt-2 w-56";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-medium text-surface"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account"
        onClick={() => setOpen((value) => !value)}
      >
        {initial}
      </button>
      {open && (
        <div id={menuId} role="menu" className={`${menuClass} rounded-lg border border-border bg-surface p-1 shadow-[0_8px_30px_rgba(23,23,23,0.06)]`}>
          <p className="truncate px-2 py-2 text-xs text-muted" title={user.email}>
            {user.email}
          </p>
          <button
            type="button"
            role="menuitem"
            className="w-full px-2 py-2 text-left text-sm hover:bg-background"
            onClick={() => void logout()}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function CreditsLink() {
  const { user, ready } = useAccount();
  const pathname = usePathname();
  const active = pathname.startsWith("/pricing");
  const label = !ready ? "Credits" : user ? `${user.credits} credits` : "Credits";

  return (
    <Link
      href="/pricing"
      aria-current={active ? "page" : undefined}
      aria-label={label}
      title={label}
      className={`group relative flex h-10 w-10 items-center justify-center font-mono text-[10px] tracking-wide ${
        active ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {ready && user ? user.credits : "Cr"}
    </Link>
  );
}

function NavButtons() {
  const pathname = usePathname();
  const createActive = pathname === "/";

  function onExplore(event: ReactMouseEvent<HTMLAnchorElement>) {
    const explore = document.getElementById("explore");
    if (!explore || pathname !== "/") return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    explore.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    explore.focus();
  }

  const item = "group relative flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground";

  return (
    <>
      <Link href="/" aria-current={createActive ? "page" : undefined} aria-label="Create" title="Create" className={`${item} ${createActive ? "bg-background text-foreground" : ""}`}>
        <IconCreate />
        <Tip>Create</Tip>
      </Link>
      <Link href="/#explore" aria-label="Explore" title="Explore" className={item} onClick={onExplore}>
        <IconExplore />
        <Tip>Explore</Tip>
      </Link>
    </>
  );
}

function Tip({ children }: { children: string }) {
  return (
    <span className="rail-tip pointer-events-none absolute left-full z-20 ml-2 whitespace-nowrap bg-foreground px-2 py-1 text-xs text-surface">
      {children}
    </span>
  );
}

export function NavigationRail() {
  return (
    <nav className="rail" aria-label="Primary">
      <Link href="/" aria-label="Nova" title="Nova" className="mb-3 flex h-10 w-10 items-center justify-center text-foreground">
        <Mark />
      </Link>
      <NavButtons />
      <div className="mt-auto flex flex-col items-center gap-1">
        <CreditsLink />
        <UserMenu placement="rail" />
      </div>
    </nav>
  );
}

export function MobileBar() {
  return (
    <header className="mobile-bar">
      <Link href="/" className="flex items-center gap-2 text-foreground" aria-label="Nova">
        <Mark />
        <span className="text-[15px] font-medium tracking-tight">Nova</span>
      </Link>
      <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
        <NavButtons />
        <CreditsLink />
        <UserMenu placement="header" />
      </nav>
    </header>
  );
}
