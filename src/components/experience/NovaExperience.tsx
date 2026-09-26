"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { SceneMotion } from "./types";

// Three and its renderer stay out of the first paint and out of mobile bundles.
const NovaCanvas = dynamic(() => import("./NovaCanvas"), { ssr: false });

export default function NovaExperience({ idea = -1 }: { idea?: number }) {
  const motion = useRef<SceneMotion>({ x: 0, y: 0, scroll: 0 });
  const container = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hero = container.current?.closest<HTMLElement>(".studio-hero");
    if (!hero) return;
    const eligible = window.matchMedia(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
    );
    let loadTimer = 0;
    let frame = 0;

    function updateEligibility() {
      window.clearTimeout(loadTimer);
      if (!eligible.matches) {
        setEnabled(false);
        return;
      }
      const test = document.createElement("canvas").getContext("webgl2");
      if (!test) {
        setEnabled(false);
        return;
      }
      test.getExtension("WEBGL_lose_context")?.loseContext();
      loadTimer = window.setTimeout(() => setEnabled(true), 360);
    }

    function updateScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = hero!.getBoundingClientRect();
        motion.current.scroll = Math.max(
          0,
          Math.min(1, -rect.top / rect.height),
        );
        hero!.style.setProperty("--hero-scroll", String(motion.current.scroll));
      });
    }

    function updatePointer(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      motion.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      motion.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
      hero!.style.setProperty("--pointer-x", `${event.clientX}px`);
      hero!.style.setProperty("--pointer-y", `${event.clientY}px`);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && !document.hidden),
      { rootMargin: "80px" },
    );
    observer.observe(hero);
    const updateVisibility = () =>
      setVisible(!document.hidden && hero.getBoundingClientRect().bottom > 0);

    updateEligibility();
    updateScroll();
    eligible.addEventListener("change", updateEligibility);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      window.clearTimeout(loadTimer);
      if (frame) cancelAnimationFrame(frame);
      eligible.removeEventListener("change", updateEligibility);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      window.removeEventListener("pointermove", updatePointer);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <div className="nova-experience" ref={container} aria-hidden="true">
      {enabled && <NovaCanvas motion={motion} visible={visible} idea={idea} />}
    </div>
  );
}
