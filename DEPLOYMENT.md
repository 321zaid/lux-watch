# Deployment guide — Infinity Horlogerie

Everything needed to take the store from demo mode to production across **Supabase**, **Stripe**, **Resend**, and **Vercel**.

The store is dual-mode: with `.env.local` empty it ships demo data and simulated flows; add the keys below and live paths light up automatically (`lib/queries.ts` and the API routes check configuration at runtime).

## 1. Supabase (data, auth, real-time catalog)

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema and seed:

   ```bash
   supabase link --project-ref <your-ref>
   supabase db push        # applies supabase/migrations/20250101000000_init.sql
   ```

   The migration creates `collections`, `products`, `product_variants`, `reviews`, `addresses`, `cart_items`, `orders` with Row-Level Security (public read for the catalog, owner-only for customer data). Order rows are inserted by the Stripe webhook via the service-role key (bypasses RLS).

3. Add any seed rows you changed in `supabase/migrations/…_seed.sql` if you authored one.
4. Manage secrets in **Project Settings → Data API**:
   - `NEXT_PUBLIC_SUPABASE_URL` — project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon (public) key
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (**server-only**, never expose in the browser bundle)

> Column names in the live path map to Product fields; adjust `lib/queries.ts` field projections if you rename anything.

## 2. Stripe (payments)

1. Create an account at [stripe.com](https://stripe.com); grab your keys from the **Developers → API keys** page:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Set up the **products + prices** your store references, or map amounts client-side (the demo uses one-off Checkout with line items built from the cart).
3. Configure the webhook:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe     # dev
   ```

   or add the endpoint in the Stripe dashboard (production URL: `https://<your-domain>/api/webhooks/stripe`). Subscribe to at least:

   - `checkout.session.completed`

   Then copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

> `app/api/checkout-sessions/route.ts` builds the session; `app/api/webhooks/stripe/route.ts` writes the order and fires the receipt. Webhook signature verification fails closed (returns `400`) and both writes run `allSettled` so an email outage never blocks an order.

## 3. Resend (transactional email)

1. Create an account at [resend.com](https://resend.com).
2. Add and verify your sending domain (e.g. `infinity-horlogerie.com`).
3. Copy:
   - `RESEND_API_KEY`
   - `RESEND_DOMAIN` — the verified domain

Receipts are sent on `checkout.session.completed`.

## 4. Vercel (hosting)

1. Push this repo to GitHub and import into Vercel.
2. Framework preset: **Next.js**. Build command `pnpm build`, output stays on Node (route handlers need it).
3. Add **all** env vars from above in **Project Settings → Environment Variables**.
4. Deploy. Go live at your domain, then update:
   - `lib/brand.config.ts` → `brand.url` to your real URL (also feeds og: metadata)
   - the Stripe webhook URL to your production domain

## 5. Verify production

- [ ] `/` loads; the cinematic scrolls and settles into the store
- [ ] A product → cart → checkout completes with a real Stripe test card (`4242 4242 4242 4242`)
- [ ] Webhook received in Stripe dashboard; order row appears in `orders`
- [ ] Confirmation email lands in the buyer's inbox
- [ ] `/account` order history reflects the purchase (real path via `auth.users`, demo path via localStorage)

## Known knobs

- **Catalog**: seed files live in `lib/data/products.ts`. The live query aliases Supabase rows onto the same `Product` type.
- **Auth**: demo auth ships in `lib/demo-auth.ts`. To enforce Supabase Auth instead, swap `AccountPanel`'s session source for `getSupabaseServer()`.
- **Hero model**: `public/models/hero-watch.glb` is already production-optimized — 32K triangles, 2 draw calls (meshes merged by material), debranded textures applied, and Draco-compressed. The decoder is bundled at `public/draco/` (no runtime CDN). Regenerate the asset with `tools/blender/12_export_glb.py` after model edits.
- **Cinematic performance**: the scene runs `frameloop="demand"` — the canvas renders only while the film is being scrubbed (plus a ~500ms settle window), so idle GPU cost is zero. The scroll-driven film is 600vh; overlay text is `pointer-events: none` and dissolves via scroll-scrubbed opacity (no React re-renders during scroll).