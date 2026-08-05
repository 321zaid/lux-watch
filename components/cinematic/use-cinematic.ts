"use client";

/** Minimal subscribe hooks for the cinematic scroll store without spamming re-renders. */
import { useEffect, useState } from "react";
import { scrollStore } from "@/lib/scroll-store";

/** True once the film has settled (p > 0.97) — used to reveal the boutique navbar. */
export function useSettled() {
  const [settled, setSettled] = useState(scrollStore.settled);
  useEffect(() => {
    let wasSettled = scrollStore.settled;
    const unsub = scrollStore.subscribe(() => {
      const now = scrollStore.settled;
      if (now !== wasSettled) {
        wasSettled = now;
        setSettled(now);
      }
    });
    return unsub;
  }, []);
  return settled;
}

/** Latches once the film reaches the signature beat (p > 0.84). Renders once, never per-frame. */
export function useSignatureLatch() {
  const [shown, setShown] = useState(() => scrollStore.progress > 0.84);
  useEffect(() => {
    let latched = scrollStore.progress > 0.84;
    if (latched) return;
    const unsub = scrollStore.subscribe(() => {
      if (!latched && scrollStore.progress > 0.84) {
        latched = true;
        setShown(true);
      }
    });
    return unsub;
  }, []);
  return shown;
}

/** Phase copy that only changes at discrete boundaries (avoids 60fps re-renders). */
export function usePhaseCopy() {
  const [copy, setCopy] = useState<{ line: string; sub: string }>({ line: "", sub: "" });
  useEffect(() => {
    let bucket = -1;
    const phrases = [
      { line: "", sub: "" },
      { line: "A study in light", sub: "Steel, cut and finished by hand" },
      { line: "The dial", sub: "Sunrayed to read as velvet" },
      { line: "In profile", sub: "A tonneau of hand-bevelled steel" },
      { line: "The bracelet", sub: "Seated link by link, by hand" },
      { line: "Perfection, paused", sub: "Look closely" },
      { line: "", sub: "" },
    ];
    const bucketFor = (p: number) => {
      if (p < 0.06) return 0;
      if (p < 0.3) return 1;
      if (p < 0.45) return 2;
      if (p < 0.6) return 3;
      if (p < 0.72) return 4;
      if (p < 0.82) return 5;
      return 6;
    };
    const unsub = scrollStore.subscribe(() => {
      const b = bucketFor(scrollStore.progress);
      if (b !== bucket) {
        bucket = b;
        setCopy(phrases[b]);
      }
    });
    return unsub;
  }, []);
  return copy;
}