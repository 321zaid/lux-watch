"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useStore } from "./cart-context";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, closeCart, cart, setQuantity, removeFromCart, subtotal } = useStore();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[2px] transition-opacity duration-500",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      {/* Panel */}
      <aside
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
        className={cn(
          "fixed right-0 top-0 z-[65] flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-7 py-6">
          <h2 className="font-display text-2xl text-ink">Your Selection</h2>
          <button onClick={closeCart} aria-label="Close bag" className="p-1 text-ink/60 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <ShoppingBag size={36} className="text-sand" strokeWidth={1.2} />
            <p className="font-display text-xl text-ink/80">Your bag is empty</p>
            <p className="font-body text-sm text-smoke">Timeless pieces await your consideration.</p>
            <button
              onClick={closeCart}
              className="mt-2 border border-ink/25 px-8 py-3 font-body text-[11px] uppercase tracking-[0.25em] text-ink hover:border-gold hover:text-gold-dark"
            >
              Browse the collection
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <ul className="flex flex-col gap-6">
                {cart.map((item) => (
                  <li key={`${item.productId}-${item.variantName}`} className="flex gap-4">
                    <Link href={`/products/${item.productSlug}`} onClick={closeCart} className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="h-24 w-24 bg-stone object-contain" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={closeCart}
                            className="font-display text-lg leading-tight text-ink hover:text-gold-dark"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 font-body text-xs uppercase tracking-wider text-smoke">{item.variantName}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantName)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1 text-ink/40 hover:text-ink"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center border border-ink/15">
                          <button
                            onClick={() => setQuantity(item.productId, item.variantName, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-1.5 text-ink/60 hover:text-ink"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center font-body text-sm">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.productId, item.variantName, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="p-1.5 text-ink/60 hover:text-ink"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-body text-sm text-ink">{formatPrice(item.priceCents * item.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-ink/10 px-7 py-6">
              <div className="flex items-center justify-between">
                <span className="font-body text-[11px] uppercase tracking-[0.3em] text-smoke">Subtotal</span>
                <span className="font-display text-2xl text-ink">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 font-body text-xs text-smoke">
                Shipping, taxes and duties calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-5 flex w-full items-center justify-center bg-ink py-4 font-body text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-graphite"
              >
                Proceed to checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}