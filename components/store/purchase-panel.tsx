"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { useStore } from "./cart-context";
import { useToast } from "@/components/ui/toaster";
import { cn, formatPrice } from "@/lib/utils";
import { Rating } from "@/components/ui/primitives";
import type { Product } from "@/lib/types";

export function PurchasePanel({ product }: { product: Product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const { toast } = useToast();
  const [variant, setVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);
  const wished = isWishlisted(product.id);

  const selectVariant = (id: string) => {
    const v = product.variants.find((x) => x.id === id);
    if (v) setVariant(v);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.35em] text-gold">
          {product.collectionLabel}
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1>
        <p className="mt-2 font-body text-sm uppercase tracking-[0.2em] text-smoke">{product.subtitle}</p>

        <div className="mt-5 flex items-center gap-4">
          <Rating value={4.8} />
          <span className="font-body text-xs text-smoke">
            {product.reviews.length > 0 ? `${product.reviews.length} reviews` : "New release"}
          </span>
        </div>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="font-display text-3xl text-ink">{formatPrice(variant.priceCents)}</span>
          {product.compareAtPriceCents && (
            <span className="font-body text-lg text-smoke line-through">
              {formatPrice(product.compareAtPriceCents)}
            </span>
          )}
        </div>
      </div>

      <p className="max-w-md font-body text-base leading-relaxed text-smoke">{product.description}</p>

      {/* Variants */}
      {product.variants.length > 1 && (
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-ink/60">Variation</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => selectVariant(v.id)}
                className={cn(
                  "border px-4 py-2.5 font-body text-xs tracking-wide transition-colors",
                  variant.id === v.id
                    ? "border-ink bg-ink text-ivory"
                    : "border-ink/20 text-ink hover:border-ink/50"
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Qty + Add */}
      <div className="flex gap-3">
        <div className="flex items-center border border-ink/15">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="p-3 text-ink/60 hover:text-ink"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-body">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            aria-label="Increase quantity"
            className="p-3 text-ink/60 hover:text-ink"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={() => {
            if (!variant) return;
            addToCart(
              {
                productId: product.id,
                productSlug: product.slug,
                name: product.name,
                image: product.images[0],
                priceCents: variant.priceCents,
                variantName: variant.name,
              },
              qty
            );
            toast(`${product.name} added to your selection.`);
          }}
          className="flex-1 bg-ink py-4 font-body text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-graphite"
        >
          Add to bag
        </button>
        <button
          onClick={() => {
            toggleWishlist(product.id);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label="Toggle wishlist"
          className={cn(
            "border px-4 transition-colors",
            wished ? "border-gold text-gold" : "border-ink/20 text-ink/60 hover:border-gold hover:text-gold"
          )}
        >
          <Heart size={17} className={cn(wished && "fill-gold text-gold")} />
        </button>
      </div>

      {/* Reassurance */}
      <div className="grid grid-cols-3 gap-6 border-t border-ink/10 pt-6">
        {[
          { icon: Truck, label: "Insured shipping", sub: "3–5 days" },
          { icon: RotateCcw, label: "30-day return", sub: "Unworn, boxed" },
          { icon: ShieldCheck, label: "5-year guarantee", sub: "Serviced in-house" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-start gap-1.5">
            <Icon size={18} className="text-gold" strokeWidth={1.6} />
            <p className="font-body text-xs font-medium uppercase tracking-wider text-ink">{label}</p>
            <p className="font-body text-[11px] text-smoke">{sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-ink/10 bg-parchment p-5">
        <p className="font-body text-[11px] uppercase tracking-[0.3em] text-gold">Available</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-smoke">
          {variant.stock > 5
            ? `${variant.stock} pieces available — each numbered and registered to its first owner.`
            : `Lowest stock — only ${variant.stock} remaining in this configuration.`}
        </p>
        <Link href="/collection" className="link-underline mt-3 inline-block font-body text-sm text-ink">
          Prefer to see it first? Browse the maison
        </Link>
      </div>
    </div>
  );
}