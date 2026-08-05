"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/components/store/cart-context";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { ProductCard } from "@/components/store/product-card";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { products } from "@/data/products";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <div className="pt-28" />
      <Container className="pb-20">
        <Eyebrow>Saved for later</Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">Wishlist</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-28 text-center">
            <Heart size={44} className="text-sand" strokeWidth={1.2} />
            <p className="font-display text-3xl text-ink">Nothing kept, yet</p>
            <p className="max-w-sm font-body text-sm text-smoke">
              Save a piece while you decide. Follow your heart — it has good taste.
            </p>
            <Link
              href="/collection"
              className="mt-2 bg-ink px-9 py-4 font-body text-[11px] uppercase tracking-[0.28em] text-ivory hover:bg-graphite"
            >
              Discover the collection
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 70} />
            ))}
          </div>
        )}
      </Container>
      <Footer />
    </main>
  );
}