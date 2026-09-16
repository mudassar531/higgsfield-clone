import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    blurb: "Try Nova with no strings attached.",
    features: [
      "100 credits on sign-up",
      "~20 image generations",
      "3 style models",
      "Public gallery access",
    ],
    cta: "Sign up free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    blurb: "For creators who generate every day.",
    features: [
      "2,000 credits / month",
      "~400 image generations",
      "All style models",
      "Priority queue",
      "Private generations",
    ],
    cta: "Get Pro",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$49",
    period: "/month",
    blurb: "For teams shipping campaigns.",
    features: [
      "6,000 credits / month",
      "~1,200 image generations",
      "All style models",
      "Priority queue",
      "Team seats (coming soon)",
    ],
    cta: "Get Studio",
    href: "/sign-up",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          Simple, credit-based pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Every plan includes the full Nova generator. Credits top up monthly and
          roll over unused as long as you stay subscribed.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              plan.highlighted
                ? "border-accent bg-surface shadow-[0_0_0_1px_var(--accent)]"
                : "border-border bg-surface"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-bold">{plan.name}</h2>
            <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.period && (
                <span className="text-sm text-muted">{plan.period}</span>
              )}
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`mt-8 rounded-full px-4 py-2.5 text-center text-sm font-bold transition ${
                plan.highlighted
                  ? "bg-accent text-accent-foreground hover:brightness-95"
                  : "border border-border text-foreground hover:bg-surface-2"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted">
        Pro and Studio are shown for illustration — this rebuild focuses on a
        real, working generator on the Free tier rather than wiring up billing.
        Every account starts with 100 real credits.
      </p>
    </div>
  );
}
