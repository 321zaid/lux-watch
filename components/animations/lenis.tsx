"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let sharedLenis: Lenis | null = null;

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      lerp: 0.08,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
    });
    sharedLenis = instance;

    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      sharedLenis = null;
    };
  }, []);

  return children;
}

/** Scroll to an absolute pixel offset (or a selector) with Lenis, falling back to native scroll. */
export function scrollToTarget(target: string | number, offset = 0) {
  const lenis = sharedLenis;
  if (lenis) {
    lenis.scrollTo(target as never, {
      offset,
      duration: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
  } else {
    const el = typeof target === "number" ? null : document.querySelector(target);
    const top = typeof target === "number" ? target : (el?.getBoundingClientRect().top ?? 0);
    window.scrollTo({ top: top + window.scrollY + offset, behavior: "smooth" });
  }
}
