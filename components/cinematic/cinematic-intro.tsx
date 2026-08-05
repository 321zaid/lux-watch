"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { scrollStore } from "@/lib/scroll-store";
import { brand } from "@/lib/brand.config";
import { scrollToTarget } from "@/components/animations/lenis";
import { useSettled, usePhaseCopy, useSignatureLatch } from "./use-cinematic";

gsap.registerPlugin(ScrollTrigger);

const Canvas = dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), {
  ssr: false,
  loading: () => null,
});

const Scene = dynamic(() => import("@/components/three/cinematic-scene").then((m) => m.CinematicScene), {
  ssr: false,
});

function SignatureReveal() {
  const sigRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const show = useSignatureLatch();

  useEffect(() => {
    if (!show) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sigRef.current,
        { opacity: 0, y: 60, scale: 0.9, filter: "blur(14px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "power3.out",
          delay: 0.1,
        }
      );
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.85 }
      );
    }, sigRef);
    return () => ctx.revert();
  }, [show]);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div ref={sigRef} className="flex flex-col items-center">
        <span className="font-signature text-7xl leading-none text-gold-light drop-shadow-[0_0_28px_rgba(212,184,134,0.45)] md:text-9xl">
          {brand.signature}
        </span>
        <div ref={textRef} className="mt-7 flex flex-col items-center gap-3">
          <span className="font-display text-2xl tracking-[0.42em] text-ivory md:text-4xl">
            {brand.tagline.toUpperCase()}
          </span>
          <span className="h-px w-16 bg-gold/50" aria-hidden />
          <span className="font-body text-[10px] uppercase tracking-[0.5em] text-ivory/45">
            Geneva · {brand.since}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CinematicIntro() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const settled = useSettled();
  const copy = usePhaseCopy();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Kick off the entrance reveal (gold field drifting, watch fading in). It is
  // time-driven so the hero is alive on arrival, before any scroll happens.
  useEffect(() => {
    scrollStore.beginIntro();
    return () => scrollStore.cancelIntro();
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          scrollStore.set(p, p > 0.97);
        },
      });
      // Scroll hint and skip control dissolve out of the way as soon as the film begins.
      // Driven by scroll, direct-to-DOM — no React re-renders.
      gsap.to(".cin-hint", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: wrapRef.current, start: "top top", end: "+=14%", scrub: true },
      });
      gsap.to(".cin-skip", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: wrapRef.current, start: "8% top", end: "+=18%", scrub: true },
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cin-logo",
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 1.4, delay: 0.4, ease: "power3.out" }
      );
      gsap.fromTo(
        ".cin-hint",
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 2.4, ease: "power2.out" }
      );
      gsap.fromTo(
        ".cin-skip",
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 2.6, ease: "power2.out" }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[600vh] bg-black" id="cinematic">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Film layer */}
        <div className="absolute inset-0">
          {ready && (
            <Canvas
              dpr={[1, 2]}
              frameloop="demand"
              camera={{ position: [3.6, 1.5, 3.6], fov: 31, near: 0.1, far: 60 }}
              gl={{ antialias: false, powerPreference: "high-performance" }}
              style={{ background: "#050505" }}
            >
              <Scene />
            </Canvas>
          )}
        </div>

        {/* Letterbox */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[8vh] bg-black" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[6vh] bg-black" aria-hidden />

        {/* Brand mark top-left — hides once the film settles into the navbar */}
        <div className="pointer-events-none absolute left-6 top-[3.6vh] z-20 md:left-10">
          <span
            className="cin-logo font-display text-lg tracking-[0.5em] text-ivory/90 transition-opacity duration-1000 md:text-xl"
            style={{ opacity: settled ? 0 : undefined }}
          >
            {brand.name.toUpperCase()}
          </span>
        </div>

        {/* Phase copy */}
        {copy.line && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[16vh] z-20 flex flex-col items-center gap-3 px-6 text-center">
            <p className="font-display text-3xl tracking-[0.18em] text-ivory/95 md:text-5xl">
              {copy.line}
            </p>
            <p className="font-body text-[10px] uppercase tracking-[0.45em] text-ivory/45 md:text-[11px]">
              {copy.sub}
            </p>
          </div>
        )}

        {/* Scroll hint */}
        <div
          className="cin-hint pointer-events-none absolute bottom-[9vh] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 opacity-0"
        >
          <span className="font-body text-[10px] uppercase tracking-[0.4em] text-ivory/50">
            Scroll to begin
          </span>
          <span
            className="h-10 w-px animate-pulse-soft bg-gradient-to-b from-transparent via-gold/70 to-transparent"
            aria-hidden
          />
        </div>

        {/* Skip intro */}
        <button
          onClick={() => scrollToTarget("#store-content")}
          className="cin-skip absolute bottom-[9vh] right-6 z-30 border border-ivory/20 px-5 py-2.5 font-body text-[10px] uppercase tracking-[0.3em] text-ivory/70 opacity-0 transition-colors duration-300 hover:border-gold hover:text-gold md:right-10"
        >
          Skip the film
        </button>

        {/* Signature reveal */}
        <SignatureReveal />
      </div>
    </div>
  );
}
