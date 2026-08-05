"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { useStore } from "@/components/store/cart-context";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toaster";
import { formatPrice } from "@/lib/utils";
import { demoAuth } from "@/lib/demo-auth";

interface Ship {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

const emptyShip: Ship = { name: "", email: "", address: "", city: "", zip: "", country: "" };

const inputClass =
  "w-full border border-ink/15 bg-ivory px-4 py-3.5 font-body text-base text-ink outline-none transition-colors focus:border-gold placeholder:text-smoke/60";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useStore();
  const { toast } = useToast();
  const [ship, setShip] = useState<Ship>(emptyShip);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; total: number } | null>(null);

  const shipping = cart.length ? 15000 : 0;
  const total = subtotal + shipping;
  const stripeLive = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  // Scroll to top when an order is placed
  useEffect(() => {
    if (placed) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [placed]);

  if (placed) {
    return (
      <main className="min-h-screen bg-ivory">
        <Navbar />
        <Container className="flex min-h-[70vh] flex-col items-center justify-center pb-24 pt-32 text-center">
          <CheckCircle2 size={52} className="text-gold" strokeWidth={1.4} />
          <h1 className="mt-6 font-display text-4xl md:text-5xl">Order confirmed</h1>
          <p className="mt-4 max-w-md font-body text-lg text-smoke">
            Your piece is now reserved, numbered, and being prepared by the maison. A confirmation
            letter has been sent to your address.
          </p>
          <div className="mt-8 rounded-sm border border-ink/10 bg-parchment px-8 py-5">
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-smoke">Order reference</p>
            <p className="font-display text-2xl text-ink">{placed.id}</p>
            <p className="mt-1 font-body text-sm text-ink">{formatPrice(placed.total)}</p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/account"
              className="bg-ink px-9 py-4 font-body text-[11px] uppercase tracking-[0.28em] text-ivory hover:bg-graphite"
            >
              View order history
            </Link>
            <Link
              href="/collection"
              className="border border-ink/25 px-9 py-4 font-body text-[11px] uppercase tracking-[0.28em] text-ink hover:border-gold hover:text-gold-dark"
            >
              Continue browsing
            </Link>
          </div>
        </Container>
        <Footer />
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-ivory">
        <Navbar />
        <Container className="flex min-h-[60vh] flex-col items-center justify-center pb-24 pt-32 text-center">
          <h1 className="font-display text-4xl text-ink">Nothing to check out yet</h1>
          <p className="mt-3 font-body text-sm text-smoke">Your bag is empty.</p>
          <Link
            href="/collection"
            className="mt-8 bg-ink px-9 py-4 font-body text-[11px] uppercase tracking-[0.28em] text-ivory hover:bg-graphite"
          >
            Browse the collection
          </Link>
        </Container>
        <Footer />
      </main>
    );
  }

  const placeOrder = async () => {
    setBusy(true);
    try {
      if (stripeLive) {
        const res = await fetch("/api/checkout-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart, shipping: ship }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Checkout failed");
        window.location.href = data.url;
        return;
      }

      // Demo mode: confirm the order locally.
      const orderId = `AST-${String(Date.now()).slice(-6)}`;
      const order = {
        id: orderId,
        status: "paid" as const,
        createdAt: new Date().toISOString(),
        totalCents: total,
        items: cart.map((i) => ({
          name: i.name,
          variantName: i.variantName,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
        shipping: { name: ship.name, address: ship.address, city: ship.city, country: ship.country },
      };
      if (demoAuth.session()) {
        demoAuth.placeOrder(order);
      } else {
        const guest = JSON.parse(localStorage.getItem("astra-guest-orders") ?? "[]");
        guest.unshift(order);
        localStorage.setItem("astra-guest-orders", JSON.stringify(guest));
      }
      clearCart();
      setPlaced({ id: orderId, total });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong — please try again", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <div className="pt-28" />
      <Container className="pb-24">
        <Eyebrow>Secure checkout</Eyebrow>
        <h1 className="mt-4 font-display text-5xl">Complete your order</h1>

        <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="font-body text-[11px] uppercase tracking-[0.3em] text-ink">Shipping details</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full name"><input className={inputClass} value={ship.name} onChange={(e) => setShip({ ...ship, name: e.target.value })} required placeholder="Alexandra Mercer" /></Field>
              <Field label="Email"><input type="email" className={inputClass} value={ship.email} onChange={(e) => setShip({ ...ship, email: e.target.value })} required placeholder="you@example.com" /></Field>
              <div className="sm:col-span-2">
                <Field label="Address"><input className={inputClass} value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} required placeholder="Rue du Rhône 42" /></Field>
              </div>
              <Field label="City"><input className={inputClass} value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} required placeholder="Geneva" /></Field>
              <Field label="Postal code"><input className={inputClass} value={ship.zip} onChange={(e) => setShip({ ...ship, zip: e.target.value })} required placeholder="1204" /></Field>
              <div className="sm:col-span-2">
                <Field label="Country"><input className={inputClass} value={ship.country} onChange={(e) => setShip({ ...ship, country: e.target.value })} required placeholder="Switzerland" /></Field>
              </div>
            </div>

            <div className="mt-10 border-t border-ink/10 pt-8">
              <h2 className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.3em] text-ink">
                <Lock size={13} className="text-gold" /> Payment
              </h2>
              <p className="mt-3 font-body text-sm text-smoke">
                {stripeLive
                  ? "You will be taken to Stripe's secure payment page to complete the purchase."
                  : "Demo checkout is active — your order will be confirmed immediately without real payment. Connect Stripe keys (see .env.example) to go live."}
              </p>
              <button
                onClick={placeOrder}
                disabled={busy || !ship.name || !ship.email || !ship.address}
                className="mt-6 w-full bg-ink py-5 font-body text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-graphite disabled:opacity-40"
              >
                {busy ? "One moment…" : stripeLive ? "Pay securely with Stripe" : `Confirm order — ${formatPrice(total)}`}
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="h-fit border border-ink/10 bg-parchment p-8 lg:sticky lg:top-28 lg:col-span-2">
            <h2 className="font-display text-2xl text-ink">Order summary</h2>
            <ul className="mt-6 space-y-4">
              {cart.map((i) => (
                <li key={`${i.productId}-${i.variantName}`} className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt="" className="h-16 w-16 bg-stone object-contain p-1" />
                  <div className="flex-1">
                    <p className="font-body text-sm text-ink">{i.name}</p>
                    <p className="font-body text-[11px] uppercase tracking-wider text-smoke">
                      {i.variantName} × {i.quantity}
                    </p>
                  </div>
                  <span className="font-body text-sm text-ink">{formatPrice(i.priceCents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-ink/10 pt-5 font-body text-sm">
              <div className="flex justify-between text-smoke"><dt>Subtotal</dt><dd className="text-ink">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between text-smoke"><dt>Insured shipping</dt><dd className="text-ink">{formatPrice(shipping)}</dd></div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium text-ink">
                <dt>Total</dt><dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-6 font-body text-xs leading-relaxed text-smoke">
              Payment is secured end-to-end. Your piece is allocated only after confirmation.
            </p>
          </aside>
        </div>
      </Container>
      <Footer />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-body text-[11px] uppercase tracking-[0.3em] text-smoke">{label}</span>
      {children}
    </label>
  );
}