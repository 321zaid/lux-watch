"use client";

/** Tiny pub-sub store for the cinematic scroll progress (0..1) and phase.
 *  Written in plain JS so it can be read from inside useFrame without re-renders. */

type Listener = () => void;

const state = {
  /** 0..1 — scrubbed cinematic timeline progress */
  progress: 0,
  /** true once the store has settled past the signature */
  settled: false,
};

const listeners = new Set<Listener>();

export const scrollStore = {
  get progress() {
    return state.progress;
  },
  get settled() {
    return state.settled;
  },
  set(p: number, settled?: boolean) {
    state.progress = p;
    if (settled !== undefined) state.settled = settled;
    listeners.forEach((l) => l());
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
