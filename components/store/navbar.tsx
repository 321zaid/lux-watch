"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useStore } from "./cart-context";
import { useSettled } from "@/components/cinematic/use-cinematic";
import { brand } from "@/lib/brand.config";
import { cn } from "@/lib/utils";
import { CartDrawer } from "./cart-drawer";

const LINKS = [
  { href: "/collection?collection=meridian", label: "Meridian" },
  { href: "/collection?collection=nocturne", label: "Nocturne" },
  { href: "/collection?collection=serie-limitee", label: "Série Limitée" },
  { href: "/collection?collection=aurora", label: "Aurora" },
  { href: "/collection", label: "All watches" },
];

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <div className="fixed inset-0 z-[80] flex bg-ivory/95 backdrop-blur-sm">
      <button onClick={onClose} aria-label="Close search" className="absolute right-6 top-6 p-2 text-ink/60 hover:text-ink md:right-10 md:top-8">
        <X size={22} />
      </button>
      <div className="mx-auto flex w-full max-w-2xl flex-col justify-center px-6">
        <p className="font-body text-[11px] uppercase tracking-[0.4em] text-gold">Search the collection</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(q.trim() ? `/collection?q=${encodeURIComponent(q.trim())}` : "/collection");
          }}
          className="mt-4 flex items-center gap-4 border-b-2 border-ink pb-3"
        >
          <Search size={22} className="text-ink/50" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Model, movement, size…"
            className="w-full bg-transparent font-display text-2xl text-ink outline-none placeholder:text-ink/30 md:text-4xl"
          />
        </form>
        <div className="mt-8 flex flex-wrap gap-2">
          {["Meridian One", "Squelette", "Bronze", "Chronograph"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setQ(s);
                router.push(`/collection?q=${encodeURIComponent(s)}`);
              }}
              className="rounded-full border border-ink/20 px-4 py-1.5 font-body text-[11px] uppercase tracking-[0.2em] text-ink/60 hover:border-gold hover:text-gold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const settled = useSettled();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { cartCount, wishlist, openCart } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On interior pages the nav is always visible; on the home page it appears
  // only once the cinematic film has settled into the boutique.
  const visible = isHome ? settled : true;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-700",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        )}
      >
        <div
          className={cn(
            "transition-all duration-700",
            scrolled ? "border-b border-ink/10 bg-ivory/90 backdrop-blur-md" : "bg-ivory"
          )}
        >
          <nav className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-6 py-4 md:px-10 md:py-5">
            {/* Left: mobile menu + links */}
            <div className="flex items-center gap-8">
              <button
                className="lg:hidden text-ink"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div className="hidden items-center gap-7 lg:flex">
                {LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="link-underline font-body text-[11px] uppercase tracking-[0.22em] text-ink/75 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center logo */}
            <Link href="/" className="font-signature text-2xl text-ink" aria-label={brand.name}>
              {brand.name}
            </Link>

            {/* Right */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-ink/70 hover:text-ink"
              >
                <Search size={18} />
              </button>
              <Link href="/wishlist" aria-label="Wishlist" className="relative p-2 text-ink/70 hover:text-ink">
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] text-ivory">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link href="/account" aria-label="Account" className="hidden p-2 text-ink/70 hover:text-ink sm:block">
                <User size={18} />
              </Link>
              <button onClick={openCart} aria-label={`Cart, ${cartCount} items`} className="relative p-2 text-ink/70 hover:text-ink">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] text-ivory">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[75] flex flex-col bg-ivory lg:hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <span className="font-signature text-2xl">{brand.name}</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <div className="flex flex-col gap-6 px-8 pt-8">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-ink/10 pb-4 font-display text-3xl text-ink"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <CartDrawer />
    </>
  );
}