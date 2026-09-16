import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-sm text-muted sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground text-xs font-black">
            ✦
          </span>
          <span className="font-semibold text-foreground">NOVA</span>
          <span>— an independent rebuild, not affiliated with Higgsfield.</span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-foreground">
            Explore
          </Link>
          <Link href="/create" className="hover:text-foreground">
            Create
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </div>
      </div>
    </footer>
  );
}
