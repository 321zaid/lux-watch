"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "infinity-cookie-consent";

type Consent = { essential: boolean; analytics: boolean } | null;

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent("infinity:cookie-settings"));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!stored);
    const open = () => setVisible(true);
    window.addEventListener("infinity:cookie-settings", open);
    return () => window.removeEventListener("infinity:cookie-settings", open);
  }, []);

  const decide = (analytics: boolean) => {
    const consent: Consent = { essential: true, analytics };
    localStorage.setItem(KEY, JSON.stringify(consent));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-ink/10 bg-parchment px-6 py-5 shadow-[0_-12px_40px_rgba(0,0,0,0.14)]"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-lg text-ink">
            We value your discretion.
          </p>
          <p className="mt-1 font-body text-sm leading-relaxed text-smoke">
            We use essential cookies to keep your cart, wishlist, and account
            secure. Optional analytics cookies only run after your consent. See
            our{" "}
            <Link href="/privacy" className="underline underline-offset-2 text-gold hover:text-gold-dark">
              privacy policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => decide(false)}
            className="border border-ink/20 px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.25em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="bg-ink px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.25em] text-ivory transition-opacity hover:opacity-80"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
