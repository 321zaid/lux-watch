"use client";

/** Tiny pub-sub store for the cinematic scroll progress (0..1) and phase.
 *  Written in plain JS so it can be read from inside useFrame without re-renders. */

type Listener = () => void;

const state = {
  /** 0..1 — scrubbed cinematic timeline progress */
  progress: 0,
  /** true once the store has settled past the signature */
  settled: false,
  /** 0..1 — entrance reveal timeline, played once on mount (time-driven, not scroll) */
  intro: 0,
  /** true while the entrance reveal is still playing */
  introActive: false,
};

const listeners = new Set<Listener>();

let introRaf = 0;

function easeOutCubic(k: number) {
  const x = 1 - k;
  return 1 - x * x * x;
}

export const scrollStore = {
  get progress() {
    return state.progress;
  },
  get settled() {
    return state.settled;
  },
  get intro() {
    return state.intro;
  },
  get introActive() {
    return state.introActive;
  },
  set(p: number, settled?: boolean) {
    state.progress = p;
    if (settled !== undefined) state.settled = settled;
    listeners.forEach((l) => l());
  },
  /** Play the entrance reveal (orbs drift, the watch fades in) once on mount. */
  beginIntro(duration = 2400) {
    if (introRaf) cancelAnimationFrame(introRaf);
    state.introActive = true;
    state.intro = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      state.intro = easeOutCubic(k);
      if (k >= 1) {
        state.introActive = false;
        state.intro = 1;
        listeners.forEach((l) => l());
        return;
      }
      introRaf = requestAnimationFrame(tick);
    };
    introRaf = requestAnimationFrame(tick);
  },
  /** Abort the entrance reveal early (e.g. component unmount). */
  cancelIntro() {
    if (introRaf) {
      cancelAnimationFrame(introRaf);
      introRaf = 0;
    }
    state.introActive = false;
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
