"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "./cart-context";
import { useToast } from "@/components/ui/toaster";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product, className, delay }: { product: Product; className?: string; delay?: number }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const { toast } = useToast();
  const wished = isWishlisted(product.id);
  const image = product.images[0];

  return (
    <article
      data-reveal
      data-reveal-delay={delay}
      className={cn(
        "group",
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-stone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-contain p-6 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105 md:p-8"
        />

        {/* Quick actions */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-stretch justify-between bg-ivory/92 backdrop-blur-sm transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart({
                productId: product.id,
                productSlug: product.slug,
                name: product.name,
                image,
                priceCents: product.priceCents,
                variantName: product.variants[0]?.name ?? "Standard",
              });
              toast(`${product.name} added to your selection.`);
            }}
            className="flex flex-1 items-center justify-center gap-2 py-3.5 font-body text-[10px] uppercase tracking-[0.25em] text-ivory hover:text-gold-light"
          >
            <ShoppingBag size={14} /> Add to bag
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
              toast(wished ? "Removed from wishlist" : "Saved to your wishlist");
            }}
            aria-label="Toggle wishlist"
            className="border-l border-ivory/20 px-4 text-ivory/80 transition-colors hover:text-gold-light"
          >
            <Heart size={15} className={cn(wished && "fill-gold text-gold")} />
          </button>
        </div>

        {product.bestseller && (
          <span className="absolute left-3 top-3 bg-ivory/90 px-3 py-1 font-body text-[9px] uppercase tracking-[0.25em] text-ink">
            Bestseller
          </span>
        )}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl leading-tight text-ink">
            <Link href={`/products/${product.slug}`} className="hover:text-gold-dark">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 font-body text-xs uppercase tracking-[0.18em] text-smoke">
            {product.collectionLabel}
          </p>
        </div>
        <p className="shrink-0 font-body text-sm text-ink">{formatPrice(product.priceCents)}</p>
      </div>
    </article>
  );
}