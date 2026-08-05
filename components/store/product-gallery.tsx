"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const image = product.images[active];

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden bg-stone"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image}
          src={image}
          alt={`${product.name} — view ${active + 1}`}
          className={cn(
            "h-full w-full object-contain p-10 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] md:p-14",
            zoom ? "scale-125" : "scale-100"
          )}
        />
        <span className="absolute left-4 top-4 bg-ivory/85 px-3 py-1 font-body text-[9px] uppercase tracking-[0.25em] text-ink">
          Studio {String(active + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Thumbs */}
      <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
        {product.images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              "h-20 w-20 shrink-0 overflow-hidden border-2 bg-stone transition-colors",
              active === i ? "border-gold" : "border-transparent hover:border-ink/30"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
          </button>
        ))}
      </div>
    </div>
  );
}