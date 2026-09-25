"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountProvider, useAccount } from "@/components/nova/account";
import InspirationRail from "@/components/nova/InspirationRail";
import { MobileBar, NavigationRail } from "@/components/nova/NavigationRail";
import PromptComposer from "@/components/nova/PromptComposer";
import StudioCanvas from "@/components/nova/StudioCanvas";
import { isFrameId, isModelId, type FrameId, type ModelId } from "@/lib/options";
import type { GenerationLike } from "@/lib/types";

const COST = 5;

function stashDraft(prompt: string, model: string, aspect: string) {
  sessionStorage.setItem("nova-draft", JSON.stringify({ prompt, model, aspect }));
}

export default function Studio({ room }: { room: GenerationLike[] }) {
  return (
    <AccountProvider>
      <StudioApp room={room} />
    </AccountProvider>
  );
}

function StudioApp({ room }: { room: GenerationLike[] }) {
  const router = useRouter();
  const { user, ready, setCredits } = useAccount();
  const [prompt, setPrompt] = useState("");
  const starter = room.find((item) => item.id.startsWith("seed-")) ?? room[0] ?? null;
  const [model, setModel] = useState<ModelId>(starter && isModelId(starter.model) ? starter.model : "flux");
  const [aspect, setAspect] = useState<FrameId>(
    starter && isFrameId(starter.aspect_ratio) ? starter.aspect_ratio : "1:1",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mine, setMine] = useState<GenerationLike[]>([]);
  const [mineReady, setMineReady] = useState(false);
  const [tab, setTab] = useState<"room" | "yours">("room");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<GenerationLike | null>(null);
  const [inspiration, setInspiration] = useState<string | null>(null);

  const ambient = starter;

  useEffect(() => {
    // sessionStorage is client-only. Reading it during render would hydrate a different prompt than the server sent.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = sessionStorage.getItem("nova-draft");
      if (!raw) return;
      sessionStorage.removeItem("nova-draft");
      const draft = JSON.parse(raw) as { prompt?: string; model?: string; aspect?: string };
      if (typeof draft.prompt === "string" && draft.prompt) {
        setPrompt(draft.prompt);
        setNotice("Draft restored.");
      }
      if (draft.model && isModelId(draft.model)) setModel(draft.model);
      if (draft.aspect && isFrameId(draft.aspect)) setAspect(draft.aspect);
    } catch {
      // A broken draft should not block the studio.
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/generations?scope=mine")
      .then((r) => (r.ok ? r.json() : { generations: [] }))
      .then((data) => {
        if (!cancelled) setMine(data.generations ?? []);
      })
      .finally(() => {
        if (!cancelled) setMineReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function loadReference(generation: GenerationLike, source: "room" | "yours") {
    setPrompt(generation.prompt);
    if (isModelId(generation.model)) setModel(generation.model);
    if (isFrameId(generation.aspect_ratio)) setAspect(generation.aspect_ratio);
    setCanvas(generation);
    setActiveId(generation.id);
    setInspiration(source === "yours" ? "Based on one of yours" : "Based on a Room image");
    setNotice(null);
    setError(null);
    if (window.matchMedia("(min-width: 1100px)").matches) {
      document.getElementById("prompt")?.focus();
    }
  }

  function clearInspiration() {
    setInspiration(null);
    setActiveId(null);
  }

  async function onGenerate() {
    if (loading || !ready) return;
    if (!prompt.trim()) {
      setError("Write a brief first.");
      return;
    }
    if (!user) {
      stashDraft(prompt, model, aspect);
      router.push("/login?next=/");
      return;
    }
    if (user.credits < COST) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), model, aspectRatio: aspect }),
      });
      const data = await res.json();
      if (res.status === 401) {
        stashDraft(prompt, model, aspect);
        router.push("/login?next=/");
        return;
      }
      if (res.status === 502) {
        setError(`${data.error ?? "Generation failed."} The 5 credits were returned.`);
        window.dispatchEvent(new Event("nova:refresh-me"));
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        if (res.status === 402) window.dispatchEvent(new Event("nova:refresh-me"));
        return;
      }
      setCanvas(data.generation);
      setInspiration(null);
      setActiveId(data.generation.id);
      setMine((prev) => [data.generation, ...prev]);
      setTab("yours");
      setCredits(data.credits);
      window.dispatchEvent(new Event("nova:refresh-me"));
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workbench">
      <a
        href="#prompt"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to prompt
      </a>
      <NavigationRail />
      <MobileBar />
      <div className="studio-col">
        <StudioCanvas image={canvas ?? ambient} loading={loading} />
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
          onClearInspiration={clearInspiration}
          onGenerate={() => void onGenerate()}
        />
      </div>
      <InspirationRail
        room={room}
        mine={mine}
        mineReady={mineReady}
        tab={tab}
        setTab={setTab}
        activeId={activeId}
        onPick={loadReference}
      />
    </div>
  );
}
