"use client";

import Link from "next/link";
import { useState } from "react";
import { AtSign, Globe } from "lucide-react";
import { brand } from "@/lib/brand.config";
import { useToast } from "@/components/ui/toaster";
import { openCookieSettings } from "@/components/store/cookie-consent";

const LINKS = [
  { name: "Tissot", href: "/collection?collection=tissot" },
  { name: "Tag Heuer", href: "/collection?collection=tag-heuer" },
  { name: "All watches", href: "/collection" },
];

const SERVICES = [
  { name: "Account", href: "/account" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Privacy policy", href: "/privacy" },
];

function FooterColumn({ title, links }: { title: string; links: typeof LINKS }) {
  return (
    <div>
      <h4 className="font-body text-[11px] uppercase tracking-[0.3em] text-ink">{title}</h4>
      <ul className="mt-5 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.name}>
            <Link href={l.href} className="font-body text-sm text-smoke transition-colors hover:text-gold-dark">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.includes("@")) return toast("Please enter a valid email address", "error");
        setBusy(true);
        try {
          const res = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data?.ok === false) {
            toast(data?.error ?? "Something went wrong. Please try again.", "error");
            return;
          }
          toast("Welcome to the maison. Your first letter is on its way.");
          setEmail("");
        } catch {
          toast("Something went wrong. Please try again.", "error");
        } finally {
          setBusy(false);
        }
      }}
      className="mt-5 flex items-center gap-3 border-b border-ink/25 pb-2 focus-within:border-gold"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        aria-label="Email address"
        disabled={busy}
        className="w-full bg-transparent font-body text-sm text-ink outline-none placeholder:text-smoke/70"
      />
      <button
        type="submit"
        disabled={busy}
        className="shrink-0 font-body text-[10px] uppercase tracking-[0.3em] text-gold hover:text-gold-dark disabled:opacity-50"
      >
        {busy ? "One moment" : "Join"}
      </button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="mt-28 border-t border-ink/10 bg-parchment">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12 md:px-10 lg:px-16">
        <div className="md:col-span-5">
          <span className="font-signature text-3xl text-ink">{brand.name}</span>
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-smoke">
            {brand.description}
          </p>
          <div className="mt-6 flex items-center gap-5">
            <a
              href="#"
              aria-label="The maison online"
              className="text-ink/50 transition-colors hover:text-gold"
            >
              <Globe size={18} />
            </a>
            <a
              href="#"
              aria-label="Contact the maison"
              className="text-ink/50 transition-colors hover:text-gold"
            >
              <AtSign size={18} />
            </a>
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
              {brand.social.instagram}
            </span>
          </div>
        </div>
        <div className="md:col-span-2">
          <FooterColumn title="Collections" links={LINKS} />
        </div>
        <div className="md:col-span-2">
          <FooterColumn title="Client care" links={SERVICES} />
          <button
            type="button"
            onClick={openCookieSettings}
            className="mt-2.5 font-body text-sm text-smoke transition-colors hover:text-gold-dark"
          >
            Cookie preferences
          </button>
        </div>
        <div className="md:col-span-3">
          <h4 className="font-body text-[11px] uppercase tracking-[0.3em] text-ink">The Journal</h4>
          <p className="mt-4 font-body text-sm text-smoke">
            Occasionally, letters on horology, restraint, and the craft of time. No noise.
          </p>
          <Newsletter />
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row md:px-10 lg:px-16">
          <p className="font-body text-xs text-smoke">
            © {new Date().getFullYear()} {brand.legalName} — {brand.tagline}.
          </p>
          <p className="font-body text-xs tracking-[0.3em] text-smoke">GENEVA · {brand.since}</p>
        </div>
      </div>
    </footer>
  );
}