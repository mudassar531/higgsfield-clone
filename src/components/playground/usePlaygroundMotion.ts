"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MOTION = {
  entrance: 0.85,
  stagger: 0.13,
  pointer: 7,
  ease: "power3.out",
};

export function usePlaygroundMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = root.current;
    if (!hero) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const entrance = gsap.timeline({ defaults: { ease: MOTION.ease } });
        entrance
          .from(hero.querySelectorAll(".hero-letter"), {
            yPercent: 105,
            rotation: 8,
            duration: MOTION.entrance,
            stagger: 0.045,
          })
          .from(
            hero.querySelectorAll(".print-surface"),
            {
              y: 55,
              scale: 0.88,
              opacity: 0,
              duration: 0.75,
              stagger: MOTION.stagger,
            },
            0.15,
          )
          .from(
            hero.querySelector(".playground-message"),
            {
              opacity: 0,
              duration: 0.45,
            },
            0.5,
          );
        return () => entrance.kill();
      },
      hero,
    );
    media.add(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        const flights = [
          ...hero.querySelectorAll<HTMLElement>(".artwork-flight"),
        ];
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            endTrigger: document.getElementById("explore")!,
            end: "top 20%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });
        flights.forEach((flight) => {
          const target = () =>
            document.querySelector<HTMLElement>(
              `.gallery-card[data-artwork="${flight.dataset.artwork}"] .gallery-card-media`,
            );
          const delta = (axis: "x" | "y") => {
            const destination = target();
            if (!destination) return 0;
            // offset positions are unaffected by the animated transforms.
            let x = 0,
              y = 0;
            for (
              let node: HTMLElement | null = flight;
              node;
              node = node.offsetParent as HTMLElement | null
            ) {
              x += node.offsetLeft;
              y += node.offsetTop;
            }
            const rect = destination.getBoundingClientRect();
            return axis === "x"
              ? rect.left +
                  window.scrollX +
                  rect.width / 2 -
                  x -
                  flight.offsetWidth / 2
              : rect.top +
                  window.scrollY +
                  rect.height / 2 -
                  y -
                  flight.offsetHeight / 2;
          };
          timeline.to(
            flight,
            {
              x: () => delta("x"),
              y: () => delta("y"),
              scaleX: () =>
                (target()?.clientWidth ?? flight.offsetWidth) /
                flight.offsetWidth,
              scaleY: () =>
                (target()?.clientHeight ?? flight.offsetHeight) /
                flight.offsetHeight,
              ease: "power1.inOut",
              duration: 1,
            },
            0,
          );
          timeline.to(
            flight.querySelector(".hero-print"),
            { rotation: 0, duration: 0.8, ease: "none" },
            0,
          );
          timeline.to(
            flight.querySelector(".print-caption"),
            { opacity: 0, duration: 0.15 },
            0,
          );
          timeline.to(flight, { autoAlpha: 0, duration: 0.12 }, 0.78);
        });
        timeline.to(
          hero.querySelector(".hero-word"),
          { y: -85, scale: 0.94, opacity: 0.15, duration: 0.8 },
          0,
        );
        return () => timeline.kill();
      },
      hero,
    );
    media.add(
      "(pointer: fine) and (min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        const layers = [
          ...hero.querySelectorAll<HTMLElement>(".print-parallax"),
        ];
        const moves = layers.map((layer, i) => ({
          x: gsap.quickTo(layer, "x", { duration: 0.7, ease: "power2.out" }),
          y: gsap.quickTo(layer, "y", { duration: 0.7, ease: "power2.out" }),
          depth: (i + 1) / 3,
        }));
        const move = (event: PointerEvent) => {
          if (window.scrollY > 100) return;
          const bounds = hero.getBoundingClientRect();
          moves.forEach(({ x, y, depth }) => {
            x((event.clientX / bounds.width - 0.5) * MOTION.pointer * depth);
            y((event.clientY / bounds.height - 0.5) * MOTION.pointer * depth);
          });
        };
        const reset = () =>
          moves.forEach(({ x, y }) => {
            x(0);
            y(0);
          });
        hero.addEventListener("pointermove", move);
        hero.addEventListener("pointerleave", reset);
        return () => {
          hero.removeEventListener("pointermove", move);
          hero.removeEventListener("pointerleave", reset);
          moves.forEach(({ x, y }) => {
            x.tween.kill();
            y.tween.kill();
          });
        };
      },
      hero,
    );
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });
    return () => {
      alive = false;
      media.revert();
    };
  }, [root]);
}
