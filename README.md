# ASTRA Horlogerie

An independent-horology storefront: a WebGL cinematic landing, a full e-commerce flow (cart → Stripe checkout → confirmation email → order history), demo auth, and a live Supabase tier behind a config swap.

Built with **Next.js 16 (App Router, Turbopack)**, **React Three Fiber**, **gsap + Lenis**, and **Tailwind v4**.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. With no env vars set, the store runs in **demo mode**: the seed catalog in `src/data`–style `data/products.ts`, cart/wishlist persisted to localStorage, Stripe checkout and account auth simulated in-browser. Everything works end-to-end without external services.

## Commands

| Command      | Purpose                               |
| ------------ | ------------------------------------- |
| `pnpm dev`   | Dev server (Turbopack)                |
| `pnpm build` | Production build (typecheck included) |
| `pnpm start` | Serve the production build            |
| `pnpm lint`  | ESLint (React Compiler rules)         |

## Structure

```
app/
  api/checkout-sessions    Stripe Checkout session creation (POST)
  api/webhooks/stripe      Stripe payment webhook → order + email
  products/[slug]          Product detail (SSG via generateStaticParams)
  collection · cart · checkout · account · wishlist
components/
  cinematic/               The WebGL + ScrollTrigger landing film
  three/                   r3f scene (watch model, dissolve particles, camera rig)
  store/                   Cart context, product cards, account panel, sections
  animations/              Lenis provider, GSAP reveal provider
lib/
  brand.config.ts          Every brand string, in one place
  data/products.ts         Seed catalog (used by demo mode)
  supabase/                Isolated client/server helpers
supabase/migrations        Live schema + RLS + seed (apply with supabase db push)
```

## Live mode

The store is deliberately dual-mode. Add the env vars in `.env.example` and imports swap from the seed catalog to Supabase; checkout becomes real Stripe; orders persist and transactional email is sent via Resend. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full setup walk-through (Supabase, Stripe, Resend, Vercel).

## Notes

- The cinematic scene expects `public/models/hero-watch.glb` (a small GLB watch model) and product imagery in `public/products/`. A placeholder setup runs without it.
- Brand identity is centralized in `lib/brand.config.ts` — change it once, everywhere updates.