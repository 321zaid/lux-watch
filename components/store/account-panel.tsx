"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, Package } from "lucide-react";
import { demoAuth, type DemoOrder } from "@/lib/demo-auth";
import { useToast } from "@/components/ui/toaster";
import { cn, formatPrice } from "@/lib/utils";

type Mode = "signin" | "signup";

export function AccountPanel() {
  const { toast } = useToast();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [session, setSession] = useState(demoAuth.session());
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Refresh order history when the session changes (mount + sign in/out).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(demoAuth.orders());
  }, [session]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const result =
      mode === "signup" ? demoAuth.signUp(email, password, name) : demoAuth.signIn(email, password);
    setBusy(false);
    if (result.error) return toast(result.error, "error");
    toast(mode === "signup" ? "Welcome to the maison." : "Welcome back.");
    setSession(demoAuth.session());
  };

  const signOut = () => {
    demoAuth.signOut();
    setSession(null);
    setOrders([]);
    toast("Signed out. Until next time.");
    router.refresh();
  };

  // ---- Logged in ----
  if (session) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-6">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.35em] text-gold">Welcome</p>
            <h2 className="mt-2 font-display text-4xl text-ink">{session.name}</h2>
            <p className="mt-1 font-body text-sm text-smoke">{session.email}</p>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 border border-ink/20 px-5 py-2.5 font-body text-[10px] uppercase tracking-[0.25em] text-ink hover:border-gold hover:text-gold-dark">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="mt-10">
          <h3 className="flex items-center gap-2 font-display text-2xl text-ink">
            <Package size={18} className="text-gold" /> Order history
          </h3>
          {orders.length === 0 ? (
            <div className="mt-6 rounded-sm border border-ink/10 bg-parchment p-10 text-center">
              <p className="font-display text-2xl text-ink">No orders yet</p>
              <p className="mx-auto mt-2 max-w-sm font-body text-sm text-smoke">
                Your numbered pieces will appear here the moment they are confirmed.
              </p>
              <Link
                href="/collection"
                className="mt-6 inline-flex items-center gap-2 border-b border-ink/40 pb-1 font-body text-[11px] uppercase tracking-[0.25em] text-ink hover:border-gold hover:text-gold-dark"
              >
                Begin with one <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="border border-ink/10 bg-parchment p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-xl text-ink">Order {o.id}</p>
                      <p className="font-body text-[11px] uppercase tracking-[0.2em] text-smoke">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-[10px] uppercase tracking-[0.25em] text-gold">Status</p>
                      <p className="font-body text-sm text-ink">Paid & confirmed</p>
                      <p className="mt-1 font-body text-sm text-ink">{formatPrice(o.totalCents)}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-2 border-t border-ink/10 pt-4">
                    {o.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between font-body text-sm">
                        <span className="text-ink">
                          {item.name} <span className="text-smoke">· {item.variantName} × {item.quantity}</span>
                        </span>
                        <span className="text-ink">{formatPrice(item.priceCents * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // ---- Signed out ----
  return (
    <div className="mx-auto max-w-md">
      <p className="font-body text-[11px] uppercase tracking-[0.35em] text-gold">Client access</p>
      <h1 className="mt-2 font-display text-4xl text-ink">
        {mode === "signin" ? "Welcome back" : "Join the maison"}
      </h1>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        {mode === "signup" && (
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Your name" />
          </Field>
        )}
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputClass} placeholder="••••••••" />
        </Field>
        <button
          type="submit"
          disabled={busy}
          className="mt-2 bg-ink py-4 font-body text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-graphite disabled:opacity-50"
        >
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-smoke">
        {mode === "signin" ? "New to the maison?" : "Already a client?"}{" "}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className={cn("link-underline text-ink")}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="mt-8 rounded-sm border border-ink/10 bg-parchment p-4 font-body text-xs leading-relaxed text-smoke">
        Demo mode is active — accounts and orders are stored on this device. Connect Supabase
        (see <code className="text-ink">.env.example</code>) to enable cloud auth &amp; order sync.
      </p>
    </div>
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

const inputClass =
  "border border-ink/15 bg-ivory px-4 py-3.5 font-body text-base text-ink outline-none transition-colors focus:border-gold placeholder:text-smoke/60";