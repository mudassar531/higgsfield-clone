"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountProvider, useAccount } from "@/components/nova/account";
import InspirationRail from "@/components/nova/InspirationRail";
import { SiteHeader } from "@/components/nova/NavigationRail";
import PromptComposer from "@/components/nova/PromptComposer";
import ImageDetail from "@/components/nova/ImageDetail";
import {
  isFrameId,
  isModelId,
  type FrameId,
  type ModelId,
} from "@/lib/options";
import type { GenerationLike } from "@/lib/types";

const STARTERS = [
  {
    label: "Something surreal",
    prompt:
      "An enormous terracotta portal on a mossy island, still emerald water, distant mountains in the mist, cinematic golden dawn, surreal architectural photography",
    model: "flux",
    aspect: "16:9",
  },
  {
    label: "A quieter world",
    prompt:
      "A tiny wooden cabin tucked into a lush forest beside a still lake, warm window light at blue hour, atmospheric editorial photography",
    model: "flux-realism",
    aspect: "3:4",
  },
  {
    label: "A little magic",
    prompt:
      "A sleepy fox curled up inside a teacup, a miniature botanical world growing around it, hand-painted storybook illustration, earthy colors and delicate details",
    model: "flux-anime",
    aspect: "1:1",
  },
] as const;

export default function Studio({ room }: { room: GenerationLike[] }) {
  return (
    <AccountProvider>
      <StudioApp initialRoom={room} />
    </AccountProvider>
  );
}

function StudioApp({ initialRoom }: { initialRoom: GenerationLike[] }) {
  const router = useRouter();
  const { user, ready, setCredits } = useAccount();
  const [room, setRoom] = useState(initialRoom);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("flux");
  const [aspect, setAspect] = useState<FrameId>("1:1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mine, setMine] = useState<GenerationLike[]>([]);
  const [mineReady, setMineReady] = useState(false);
  const [mineError, setMineError] = useState<string | null>(null);
  const [tab, setTab] = useState<"room" | "yours">("room");
  const [selected, setSelected] = useState<GenerationLike | null>(null);
  const [selectedSource, setSelectedSource] = useState<"room" | "yours">(
    "room",
  );
  const [inspiration, setInspiration] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (prompt)
          sessionStorage.setItem(
            "nova-draft",
            JSON.stringify({ prompt, model, aspect }),
          );
        else sessionStorage.removeItem("nova-draft");
      } catch {
        /* The current draft still lives in the editor if storage is unavailable. */
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [prompt, model, aspect]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    function readHash() {
      if (window.location.hash === "#yours") {
        setTab("yours");
        requestAnimationFrame(() =>
          document
            .getElementById("explore")
            ?.scrollIntoView({ block: "start" }),
        );
      } else if (window.location.hash === "#explore") setTab("room");
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    try {
      const raw = sessionStorage.getItem("nova-draft");
      if (raw) {
        const draft = JSON.parse(raw) as {
          prompt?: string;
          model?: string;
          aspect?: string;
        };
        if (typeof draft.prompt === "string") {
          setPrompt(draft.prompt.slice(0, 800));
          setNotice("Welcome back. Your idea is right where you left it.");
        }
        if (draft.model && isModelId(draft.model)) setModel(draft.model);
        if (draft.aspect && isFrameId(draft.aspect)) setAspect(draft.aspect);
        sessionStorage.removeItem("nova-draft");
      }
    } catch {
      /* Storage can be unavailable in private browser modes. */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/generations?scope=mine")
      .then(async (res) => {
        if (res.status === 401) return { generations: [] };
        if (!res.ok)
          throw new Error("We couldn't load your images. Please try again.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setMine(data.generations ?? []);
      })
      .catch(() => {
        if (!cancelled)
          setMineError(
            "We couldn't load your images. Your collection is still saved.",
          );
      })
      .finally(() => {
        if (!cancelled) setMineReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function focusPrompt() {
    requestAnimationFrame(() => {
      document.getElementById("prompt")?.focus({ preventScroll: true });
      document
        .getElementById("prompt")
        ?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "center",
        });
    });
  }
  function navigateGallery(next: "room" | "yours") {
    setTab(next);
    window.history.replaceState(
      null,
      "",
      next === "yours" ? "#yours" : "#explore",
    );
    document
      .getElementById("explore")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  }
  function usePrompt(generation: GenerationLike) {
    setPrompt(generation.prompt.slice(0, 800));
    if (isModelId(generation.model)) setModel(generation.model);
    if (isFrameId(generation.aspect_ratio)) setAspect(generation.aspect_ratio);
    setSelected(null);
    setInspiration("Inspired by a shared prompt. Add your own twist.");
    setError(null);
    setNotice(null);
    focusPrompt();
  }
  function saveDraft() {
    try {
      sessionStorage.setItem(
        "nova-draft",
        JSON.stringify({ prompt, model, aspect }),
      );
    } catch {
      /* Sign-in remains available without storage. */
    }
  }
  function signInWithDraft() {
    saveDraft();
    router.push("/login?next=/");
  }
  async function onGenerate() {
    if (loading || !ready) return;
    if (!prompt.trim()) {
      setError("Start with a few words about the image you have in mind.");
      focusPrompt();
      return;
    }
    if (!user) {
      signInWithDraft();
      return;
    }
    if (user.credits < 5) {
      setError(
        "You've used your credits. Your creations are still in your collection.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          aspectRatio: aspect,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        signInWithDraft();
        return;
      }
      if (!res.ok) {
        setError(
          data.error ?? "We couldn't finish that image. Please try again.",
        );
        window.dispatchEvent(new Event("nova:refresh-me"));
        return;
      }
      setMine((prev) => [data.generation, ...prev]);
      setRoom((prev) => [data.generation, ...prev]);
      setMineReady(true);
      setMineError(null);
      setTab("yours");
      setSelectedSource("yours");
      setSelected(data.generation);
      setInspiration(null);
      setNotice("Your image is ready and saved in My creations.");
      setCredits(data.credits);
      window.dispatchEvent(new Event("nova:refresh-me"));
    } catch {
      setError(
        "The connection was interrupted. Check My creations before trying again.",
      );
      window.dispatchEvent(new Event("nova:refresh-me"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <a href="#prompt" className="skip-link">
        Skip to create an image
      </a>
      <section className="studio-hero" aria-labelledby="studio-title">
        <div className="studio-hero-art" aria-hidden="true" />
        <SiteHeader
          overlay
          onGallery={navigateGallery}
          onBeforeAuth={saveDraft}
        />
        <div className="studio-hero-content">
          <p className="hero-kicker">An open space for imagination</p>
          <h1 id="studio-title" className="hero-title">
            A little thought.
            <br />A whole new <em>world.</em>
          </h1>
          <p className="hero-description">
            The extraordinary starts with an idea.
            <br />
            Turn yours into images worth getting lost in.
          </p>
          <div className="hero-fineprint">
            <span aria-hidden>✧</span> 100 credits on us. No card, just
            curiosity.
          </div>
        </div>
        <div className="hero-art-caption" aria-hidden="true">
          <span>01 / THE OTHER SIDE</span>
          <span>Nova studio artwork</span>
        </div>
        <div className="hero-composer-wrap">
          <div className="composer-stack">
            <PromptComposer
              prompt={prompt}
              setPrompt={(value) => {
                setPrompt(value);
                setNotice(null);
                setError(null);
              }}
              model={model}
              setModel={setModel}
              aspect={aspect}
              setAspect={setAspect}
              loading={loading}
              error={error}
              notice={notice}
              inspiration={inspiration}
              onClearInspiration={() => setInspiration(null)}
              onGenerate={() => void onGenerate()}
            />
            <div className="prompt-starters">
              <span>NEED A SPARK?</span>
              {STARTERS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setPrompt(starter.prompt);
                    setModel(starter.model);
                    setAspect(starter.aspect);
                    setError(null);
                    setNotice(null);
                    focusPrompt();
                  }}
                >
                  {starter.label} <span aria-hidden>↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="studio-manifesto">
        <span>YOUR WORDS. YOUR WORLD.</span>
        <p>A place to experiment. A space to surprise yourself.</p>
        <span aria-hidden>✳</span>
      </div>
      <InspirationRail
        room={room}
        mine={mine}
        mineReady={mineReady}
        mineError={mineError}
        tab={tab}
        setTab={setTab}
        onPick={(image, source) => {
          setSelected(image);
          setSelectedSource(source);
        }}
      />
      {selected && (
        <ImageDetail
          image={selected}
          source={selectedSource}
          onClose={() => setSelected(null)}
          onUse={usePrompt}
        />
      )}
    </main>
  );
}
