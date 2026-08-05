"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { fetchProducts, liveData } from "@/lib/queries";
import { ProductCard } from "./product-card";
import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/primitives";
import type { CollectionSlug, Product } from "@/lib/types";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

export function ProductGrid({
  collection,
  sort,
  query,
}: {
  collection: string;
  sort: string;
  query: string;
}) {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [live, setLive] = useState<Product[] | null>(null);

  // Re-derive from URL so links elsewhere still work; props are the source of truth.
  const currentCollection = searchParams.get("collection") ?? collection;
  const currentSort = searchParams.get("sort") ?? sort;
  const currentQuery = searchParams.get("q") ?? query;

  // When Supabase is configured, source the catalog from the live database with the
  // seed as fallback; otherwise the grid is purely local (demo mode).
  useEffect(() => {
    if (!liveData) return;
    let cancelled = false;
    fetchProducts({
      collection: (currentCollection || undefined) as CollectionSlug | undefined,
      sort: currentSort as "featured" | "price-asc" | "price-desc" | "newest",
      search: currentQuery || undefined,
    })
      .then((res) => {
        if (!cancelled) setLive(res);
      })
      .catch(() => {
        if (!cancelled) setLive(null);
      });
    return () => {
      cancelled = true;
    };
  }, [currentCollection, currentSort, currentQuery]);

  const list = useMemo(() => {
    let out = [...(live ?? products)];
    if (currentCollection) {
      out = out.filter((p) => p.collection === (currentCollection as CollectionSlug));
    }
    if (currentQuery) {
      const q = currentQuery.toLowerCase();
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.collectionLabel.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q)
      );
    }
    switch (currentSort) {
      case "price-asc":
        out.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-desc":
        out.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "newest":
        out.sort((a, b) => Number(Boolean(b.newArrival)) - Number(Boolean(a.newArrival)));
        break;
      default:
        out.sort((a, b) => Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)));
    }
    return out;
  }, [live, currentCollection, currentSort, currentQuery]);

  return (
    <section>
      <Container className="py-10">
        {/* Sort row */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-body text-sm text-smoke">
            {list.length} {list.length === 1 ? "model" : "models"}
          </p>
          <div className="flex items-center gap-2" role="group" aria-label="Sort products">
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <select
              id="sort"
              value={currentSort}
              onChange={(e) => {
                setPending(true);
                const params = new URLSearchParams(searchParams.toString());
                params.set("sort", e.target.value);
                window.location.search = params.toString();
              }}
              className="cursor-pointer border border-ink/15 bg-ivory px-4 py-2.5 font-body text-xs uppercase tracking-[0.2em] text-ink outline-none focus:border-gold"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pending ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="mt-4 h-6 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="font-display text-3xl text-ink">Nothing matches that search</p>
            <p className="max-w-sm font-body text-sm text-smoke">
              Try a different combination, or browse the full maison.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={(i % 4) * 70} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}