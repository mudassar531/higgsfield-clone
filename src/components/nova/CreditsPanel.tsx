"use client";

import Link from "next/link";
import { useAccount } from "@/components/nova/account";

export default function CreditsPanel() {
  const { user, ready } = useAccount();

  return (
    <article className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Nova</p>
      <h1 className="mt-3 text-4xl tracking-tight">Credits</h1>
      <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Starting balance</dt>
          <dd className="mt-2 text-4xl tracking-tight">100</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Per image</dt>
          <dd className="mt-2 text-4xl tracking-tight">5</dd>
        </div>
      </dl>
      <p className="mt-6 text-[15px] leading-relaxed text-muted">
        Nova Flux, Nova Realism, and Nova Anime each cost 5 credits. The server checks your balance before it makes an image. If generation fails, those 5 credits are returned.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {ready && !user && (
          <Link href="/sign-up" className="bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground">
            Create an account
          </Link>
        )}
        <Link href="/" className="border border-border px-4 py-2.5 text-sm">
          Back to the studio
        </Link>
      </div>
      <p className="mt-10 text-xs text-muted">Nova is independent and not affiliated with Higgsfield.</p>
    </article>
  );
}
