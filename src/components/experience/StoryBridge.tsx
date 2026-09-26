"use client";

import { useEffect, useRef } from "react";
import NovaImage from "@/components/nova/NovaImage";
import { frameMeta } from "@/lib/options";
import type { GenerationLike } from "@/lib/types";

const STEPS = ["Thought", "Idea", "Form", "World", "Creation", "Community"];

export default function StoryBridge({ images }: { images: GenerationLike[] }) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const planes = Array.from(
      element.querySelectorAll<HTMLElement>(".world-plane"),
    );
    let active = false;
    let frame = 0;

    function update() {
      if (!active || frame || still.matches) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element!.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)),
        );
        const unfold = Math.max(0, Math.min(1, (progress - 0.13) / 0.62));
        const directions = [
          [-142, 130, -17],
          [0, 185, 13],
          [148, 130, 20],
        ];
        planes.forEach((plane, index) => {
          const [x, y, rotation] = directions[index] ?? directions[1];
          plane.style.transform = `translate3d(${x * (1 - unfold)}px, ${y * (1 - unfold)}px, 0) rotate(${rotation * (1 - unfold)}deg) scale(${0.62 + unfold * 0.38})`;
          plane.style.opacity = String(0.36 + unfold * 0.64);
        });
        element!.style.setProperty("--bridge-unfold", String(unfold));
      });
    }

    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) update();
    });
    observer.observe(element);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section className="story-bridge" ref={section} aria-labelledby="story-title">
      <div className="story-bridge-inner">
        <div className="story-copy">
          <p className="section-kicker">02 / WHERE IDEAS TAKE SHAPE</p>
          <h2 id="story-title">
            An idea finds its <em>form.</em>
            <br />
            Then it finds a world.
          </h2>
          <p>
            Words become images. Images become starting points for someone else.
          </p>
        </div>
        <div className="story-art" aria-hidden="true">
          <span className="story-core-echo" />
          {images.slice(0, 3).map((image, index) => {
            const frame = frameMeta(image.aspect_ratio);
            return (
              <div className={`world-plane world-plane-${index + 1}`} key={image.id}>
                <NovaImage
                  src={image.image_url}
                  alt=""
                  width={frame.width}
                  height={frame.height}
                  sizes="(max-width: 700px) 35vw, 18vw"
                />
              </div>
            );
          })}
        </div>
        <ol className="story-steps" aria-label="The creative journey">
          {STEPS.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span> {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
