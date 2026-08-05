"use client";

import { useEffect } from "react";

/** IntersectionObserver-driven reveal for any element carrying [data-reveal].
 *  Add `.is-revealed` when in view; respects prefers-reduced-motion via CSS. */
export function RevealProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      elements.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const delay = (entry.target as HTMLElement).dataset.revealDelay;
            if (delay) {
              window.setTimeout(() => entry.target.classList.add("is-revealed"), Number(delay));
            } else {
              entry.target.classList.add("is-revealed");
            }
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}