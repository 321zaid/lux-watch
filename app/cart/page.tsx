"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/components/store/cart-context";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { cart, setQuantity, removeFromCart, subtotal } = useStore();
  const shipping = cart.length === 0 ? 0 : 15000; // $150 insured
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <div className="pt-28" />
      <Container className="pb-16">
        <Eyebrow>Your selection</Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">The Bag</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-28 text-center">
            <ShoppingBag size={44} className="text-sand" strokeWidth={1.2} />
            <p className="font-display text-3xl text-ink">Your bag is empty</p>
            <p className="max-w-sm font-body text-sm text-smoke">
              Every piece in the maison is made to be kept. Begin with one.
            </p>
            <Link
              href="/collection"
              className="mt-2 bg-ink px-9 py-4 font-body text-[11px] uppercase tracking-[0.28em] text-ivory hover:bg-graphite"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-3">
            {/* Items */}
            <ul className="flex flex-col divide-y divide-ink/10 lg:col-span-2">
              {cart.map((item) => (
                <li key={`${item.productId}-${item.variantName}`} className="flex gap-5 py-8">
                  <Link href={`/products/${item.productSlug}`} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-32 w-32 bg-stone object-contain p-2" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/products/${item.productSlug}`} className="font-display text-2xl text-ink hover:text-gold-dark">
                          {item.name}
                        </Link>
                        <p className="mt-0.5 font-body text-xs uppercase tracking-[0.2em] text-smoke">
                          {item.variantName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantName)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1.5 text-ink/40 transition-colors hover:text-red-500"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-ink/15">
                        <button
                          onClick={() => setQuantity(item.productId, item.variantName, item.quantity - 1)}
                          aria-label="Decrease"
                          className="p-2 text-ink/60 hover:text-ink"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.productId, item.variantName, item.quantity + 1)}
                          aria-label="Increase"
                          className="p-2 text-ink/60 hover:text-ink"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="font-body text-base text-ink">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <aside className="h-fit border border-ink/10 bg-parchment p-8 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl text-ink">Summary</h2>
              <dl className="mt-6 space-y-3 font-body text-sm">
                <div className="flex justify-between text-smoke">
                  <dt>Subtotal</dt>
                  <dd className="text-ink">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-smoke">
                  <dt>Insured shipping</dt>
                  <dd className="text-ink">{cart.length ? formatPrice(shipping) : "—"}</dd>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-4 text-base font-medium text-ink">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                className="mt-8 flex w-full items-center justify-center bg-ink py-4 font-body text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-graphite"
              >
                Proceed to checkout
              </Link>
              <p className="mt-4 text-center font-body text-[11px] text-smoke">
                Duties & taxes calculated at checkout · 30-day returns
              </p>
            </aside>
          </div>
        )}
      </Container>
      <Footer />
    </main>
  );
}