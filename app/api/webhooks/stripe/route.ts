import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { brand } from "@/lib/brand.config";

export const runtime = "nodejs";

/**
 * Stripe webhook: payment_intent.succeeded / checkout.session.completed →
 * writes the order into Supabase (when configured) and sends the
 * confirmation email (when Resend is configured). Fails silently on
 * missing secrets so the store remains functional in demo mode.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return new NextResponse("not configured", { status: 501 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("webhook signature invalid", err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const cart = JSON.parse(session.metadata?.cart ?? "[]") as {
      name: string;
      variantName: string;
      priceCents: number;
      quantity: number;
    }[];
    const total = session.amount_total ?? 0;

    await Promise.allSettled([
      writeOrder(session, cart, total),
      sendEmail(session, cart, total),
    ]);
  }

  return NextResponse.json({ received: true });
}

async function writeOrder(
  session: Stripe.Checkout.Session,
  cart: { name: string; variantName: string; priceCents: number; quantity: number }[],
  total: number
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;
  const sb = createClient(url, serviceKey);
  await sb.from("orders").insert({
    stripe_session_id: session.id,
    customer_email: session.customer_email ?? session.customer_details?.email ?? null,
    total_cents: total,
    currency: session.currency ?? "usd",
    items: cart,
    shipping: session.customer_details ?? null,
    status: "paid",
  });
}

async function sendEmail(
  session: Stripe.Checkout.Session,
  cart: { name: string; variantName: string; priceCents: number; quantity: number }[],
  total: number
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: `${brand.name} <orders@${process.env.RESEND_DOMAIN ?? "example.com"}>`,
    to: [session.customer_email ?? ""],
    subject: `Your ${brand.name} order is confirmed`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1a1a1a">
        <h1 style="letter-spacing:.2em">${brand.name.toUpperCase()}</h1>
        <p>Thank you for your order. Your piece is being prepared by the maison.</p>
        <ul style="padding:0">
          ${cart.map((i) => `<li style="list-style:none;padding:6px 0;border-bottom:1px solid #eee">${i.name} — ${i.variantName} × ${i.quantity}</li>`).join("")}
        </ul>
        <p>Total: ${(total / 100).toFixed(2)} ${(session.currency ?? "usd").toUpperCase()}</p>
        <p style="color:#888">— ${brand.tagline}</p>
      </div>
    `,
  });
}