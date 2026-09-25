"use client";

import Link from "next/link";
import Mark from "@/components/nova/Mark";
import { useAccount } from "@/components/nova/account";

export default function CreditsPanel() {
  const { user, ready } = useAccount();
  const credits = user?.credits ?? 100;
  return (
    <>
      <section className="credits-layout">
        <div>
          <p className="credits-overline">
            <Mark className="h-4 w-4" /> A LITTLE SPACE TO PLAY
          </p>
          <h1 className="credits-title">
            Less overthinking.
            <br />
            <em>More creating.</em>
          </h1>
          <p className="credits-copy">
            A hundred credits to begin. Five for every image. Pick a style,
            follow a thought, see where it takes you.
          </p>
          <p className="credits-copy">
            Every finished image is saved to your collection. If an image can’t
            be created, its credits come back to you.
          </p>
          <div className="credits-cta">
            <Link
              href={ready && user ? "/#prompt" : "/sign-up?next=/"}
              className="generate-button"
            >
              {ready && user
                ? "Make something new"
                : "Start with 100 free credits"}{" "}
              <span aria-hidden>↗</span>
            </Link>
            <Link
              href="/#explore"
              className="detail-secondary credits-secondary"
            >
              Find some inspiration
            </Link>
          </div>
        </div>
        <div className="credits-card">
          <div className="credits-card-top">
            <span>
              {!ready
                ? "LOADING YOUR BALANCE"
                : user
                  ? "YOUR CREATIVE FUEL"
                  : "YOUR WELCOME ALLOWANCE"}
            </span>
            <Mark className="h-6 w-6 text-accent" />
          </div>
          <div className="credits-balance">
            <strong>{ready ? credits : "—"}</strong>
            <span>credits{ready && !user ? " on sign-up" : " available"}</span>
          </div>
          <div className="credits-progress" aria-hidden>
            <span
              style={{
                width: ready ? `${Math.min(100, Math.max(0, credits))}%` : "0%",
              }}
            />
          </div>
          <p className="credits-card-note">
            {!ready
              ? "A moment while we check your account."
              : credits < 5
                ? "Your credits are used up. Your images are still yours to explore."
                : `Room for ${Math.floor(credits / 5)} more ${Math.floor(credits / 5) === 1 ? "idea" : "ideas"}${!user ? " when you join" : ""}.`}
          </p>
          <div className="credits-stats">
            <div className="credits-stat">
              EVERY IMAGE<strong>5 credits</strong>
            </div>
            <div className="credits-stat">
              EVERY NEW ACCOUNT<strong>100 credits</strong>
            </div>
          </div>
          <div className="credits-how">
            <span className="credits-how-mark">✧</span>
            <p>
              One simple allowance. No subscriptions or paid top-ups. Generation
              failures are refunded automatically.
            </p>
          </div>
        </div>
      </section>
      <section className="how-section" aria-labelledby="how-title">
        <p className="section-kicker">FROM A THOUGHT TO A THING</p>
        <h2 id="how-title">
          Three small steps. <em>Something entirely yours.</em>
        </h2>
        <div className="how-grid">
          <article>
            <span>01</span>
            <h3>Follow a thought.</h3>
            <p>
              A place, a feeling, a scene from a dream. Describe what’s on your
              mind, or borrow a community prompt.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Find its shape.</h3>
            <p>
              Choose an imaginative, photographic, or illustrated style. Give it
              a square, portrait, or wide frame.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>See what happens.</h3>
            <p>
              Make your image for 5 credits. Save the original, try another
              idea, or share a new starting point.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
