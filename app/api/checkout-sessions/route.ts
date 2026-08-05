import { NextResponse } from "next/server";
import Stripe from "stripe";

/** Creates a Stripe Checkout Session for the current cart. */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe is not configured on this deployment." }, { status: 501 });
  }

  try {
    const body = await req.json();
    const items = body.items as {
      name: string;
      priceCents: number;
      quantity: number;
      variantName: string;
    }[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.priceCents,
          product_data: {
            name: `${item.name} — ${item.variantName}`,
            metadata: { brand: "INFINITY" },
          },
        },
      })),
      customer_email: body.shipping?.email || undefined,
      shipping_address_collection: { allowed_countries: ["US", "CH", "GB", "DE", "FR", "IT", "JP", "AE", "CA", "AU"] },
      metadata: {
        cart: JSON.stringify(items),
      },
      success_url: `${origin}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout-session error", err);
    return NextResponse.json({ error: "Unable to create the checkout session." }, { status: 500 });
  }
}