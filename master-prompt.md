# MASTER PROMPT — Cinematic Luxury Watch Store (Full-Stack Build)

Paste this whole file to your coding agent as the initial instruction. It replaces the earlier draft — it's tighter, resolves the ambiguities that were left open, and adds the backend/hosting layer needed for a store that actually sells things.

## Assumptions made below (change any of these before you send it)
- **Payments:** Stripe (Checkout + webhooks). Swap if you prefer another processor.
- **Transactional email** (order receipts): Resend. Swap if you prefer another provider.
- **Admin/inventory management:** out of scope for v1 — you'll manage products via Supabase Studio or SQL directly at first. Flag if you want a real admin UI built now instead.
- Package manager: pnpm. Swap if you prefer npm/yarn.

---

## ROLE

You are an elite senior full-stack engineer, 3D graphics engineer, and luxury e-commerce UI/UX specialist. Build a production-ready, award-worthy luxury watch e-commerce site that feels like an interactive cinematic experience — and that also fully works as a store (real product data, real cart, real checkout), not just a visual demo.

Everything must be modular, scalable, cleanly architected, type-safe, and performance-optimized.

---

## STEP 1 — Prepare the 3D Watch Asset

Two source GLBs were provided. Here's what inspection already found, so you don't need to rediscover it:

- **Geometry is identical in both files**: 56 mesh primitives, 114 nodes, ~193,000 triangles, only **2 materials** (`metal` and `Glass`). This is a Sketchfab export (root node is literally named `Sketchfab_model`).
- **The only difference between the two files is texture resolution**: `seiko_watch.glb` ships 2048×2048 textures (14.4 MB total); `seiko_watch (1).glb` ships the same 6 textures downscaled to 1024×1024 (9.4 MB total). There is no polycount or quality-tier difference to "choose" between — it's the same model at two texture resolutions.
- **Start from the 1024px version** as your working file. Only pull the 2048px textures back in for the specific texture(s) that need it (see dial note below).
- **Texture map layout** (both files):
  - Material `metal` → baseColor: image 0 (JPEG), ORM (occlusion/roughness/metallic packed): image 1, normal: image 2
  - Material `Glass` → baseColor: image 3 (has alpha), ORM: image 4, normal: image 5
- **193K triangles is far too dense** for a real-time hero asset. Decimate aggressively while preserving silhouette — target 20,000–40,000 tris. The 56 primitives sharing only 2 materials should collapse to 2 draw calls after merging by material.

### Debranding (required)
Mesh, node, and material names are already generic (`Cylinder`, `Cube`, `defaultMaterial`, `metal`, `Glass`) — no brand strings live in the geometry. **The brand wordmark is baked into the shared `metal` baseColor texture** (image 0), which is the single atlas used across the entire watch body, so it's almost certainly where the dial text and any caseback engraving live. This can't be fixed by deleting geometry — it has to be edited at the pixel level:

1. Open image 0 (`metal` baseColor, 2048×2048) in Blender's Image Editor or an external tool (GIMP/Photoshop/Affinity).
2. Locate the dial and caseback UV regions in the atlas and paint out/clone-stamp/inpaint any printed text or logo. Replace with a clean dial surface (or a neutral placeholder mark if the design calls for one).
3. Check the other 5 textures too (normal/ORM maps can carry embossed logo geometry as height/normal detail) — flatten anything that reads as a wordmark.
4. Re-bake normal/AO maps after the edit if the geometry decimation in the same pass changes topology.
5. **Split the atlas before final export**: keep the dial/hands region at full 2048px (it's the subject of your macro/close-up camera shots — Step 4 below — and will look soft at 1024px in a tight shot), but downscale the case/bracelet/crown region to 1024px or even 512px since it's rarely seen in full-frame close-up. Two smaller targeted textures will look better *and* be lighter than one shared 2048px atlas.
6. Rename the final exported file away from any brand reference — e.g. `hero-watch.glb` — and make sure no "seiko" string survives anywhere in the repo (filenames, variable names, comments, commit messages).

### Blender pipeline
Blender install: `C:\Program Files\Blender Foundation\Blender 5.0\` (confirm the path exists before running; fall back to prompting for the correct path if not).

- Remove duplicate vertices and hidden/internal geometry.
- Decimate to target triangle count while preserving silhouette (esp. bezel, lugs, crown, dial edge).
- Merge meshes by material (target: 2 draw calls).
- Recalculate normals, recompute smooth shading.
- Optimize UVs; execute the atlas split described above.
- Compress textures (WebP or KTX2/Basis Universal — KTX2 preferred since it's GPU-decoded and reduces runtime VRAM, not just download size; use `KTXLoader`/`meshoptimizer` in R3F).
- Enable Draco (or meshopt) geometry compression on export.
- Export a clean, production-ready `.glb`.

**Target: under 3 MB as the goal, 8 MB as the hard ceiling.** No visible quality loss at hero-shot distance; the dial must stay crisp under macro close-up.

---

## STEP 2 — Tech Stack

**Frontend**
Next.js (App Router) · React · TypeScript · Tailwind CSS · React Three Fiber · Drei · GSAP + ScrollTrigger · Framer Motion · Lenis (smooth scroll) · shadcn/ui · Lucide Icons

**Backend / Data**
- **Supabase** (Postgres + Auth + Storage) for all persistent data: product catalog, variants, inventory, orders, customer accounts, cart, reviews. Use Row Level Security on every table — public read on catalog data, owner-only read/write on orders/cart/addresses, writes to orders restricted to service-role/server context only.
- Schema as versioned SQL migrations in `supabase/migrations/` — never hand-edited via dashboard only. Starting table set: `products`, `product_variants`, `collections`, `orders`, `order_items`, `addresses`, `cart_items`, `reviews`. Use Supabase Auth's built-in `auth.users` for customer identity rather than a parallel users table.
- **Stripe** for checkout (Checkout Sessions or Payment Intents) and webhook-driven order status updates. Implement as Next.js Route Handlers (`app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`) — Cloudflare's Next.js adapter runs the Node.js runtime, so this stays in one deployment target instead of splitting logic across two platforms.
- **Resend** (or chosen provider) for order confirmation email, triggered from the Stripe webhook handler.

**Hosting**
- **Cloudflare Workers** via the OpenNext adapter (`@opennextjs/cloudflare`) — this is the current recommended path for full-stack Next.js on Cloudflare (SSR, ISR, middleware, Node runtime all supported); Cloudflare Pages is the legacy route and shouldn't be used for a new full-stack build.
- Use **Cloudflare Images** for `next/image` (its default Vercel-based optimizer won't work off-Vercel) — write a custom loader against the Cloudflare Images transform endpoint.
- Consider **Cloudflare R2** for the GLB model and large editorial/lifestyle images if they grow beyond what you want bundled into the Worker's static assets — cheap/no egress fees.
- Deploy via **Wrangler**, configured for GitHub-connected auto-deploy (Cloudflare "Workers Builds") so pushes to `main` deploy automatically once the repo is connected.

**Source control**
- GitHub is the repo of record for the whole project (frontend, `supabase/migrations`, Wrangler config). This is the "backend repo" in the sense that it's the single source of truth everything deploys from — Supabase and Cloudflare both read their config/schema from what's committed here.

---

## STEP 2b — Local-First Development (important)

Build and fully test this locally before any cloud account exists. Do **not** attempt to create a Supabase project, a Cloudflare account, or a GitHub repo yourself — those get provisioned by the user once local testing is done.

- Use the **Supabase CLI + Docker** for a fully local Postgres/Auth/Storage instance during development. Migrations in `supabase/migrations/` should apply cleanly to both the local instance and, later, a real project.
- All secrets/config come from environment variables, never hardcoded. Commit a `.env.example` with placeholder keys; real values live in a git-ignored `.env.local`.
- Build a thin data-access layer (`lib/supabase/client.ts`, `lib/supabase/server.ts`) so swapping from local Supabase → a live project is purely an env var change, no code change.
- Stripe: use test-mode keys and the Stripe CLI's webhook forwarding for local testing.
- Produce a `DEPLOYMENT.md` at the repo root documenting the steps the user will take once they're ready to go live: create the Supabase project and run migrations against it, create the GitHub repo and push, connect that repo in Cloudflare Workers Builds, set production secrets (Stripe live keys, Supabase URL/anon key/service key, Resend key) in Cloudflare's dashboard. You're documenting this for later, not doing it now.

```
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
```

---

## STEP 3 — Cinematic Landing

Visitors don't see a store first — they see a reveal.

- Pure black background. A watch slowly emerges from darkness, lit only by studio-style cinematic lighting. No text, no UI chrome, on load.
- Scroll drives the entire sequence — do not let the page scroll normally during this phase. Scroll position maps to camera movement, watch rotation, lighting, reflections, zoom, and depth, all synchronized via GSAP ScrollTrigger.

## STEP 4 — Camera Sequence

A seamless sequence of shots, transitioning smoothly, no hard cuts: slow orbit → close-up on crown → close-up on dial → reflection sweep across the sapphire crystal → macro on the hands → side profile → bracelet reveal → final centered composition.

## STEP 5 — Look & Feel

HDRI lighting, bloom, depth of field, soft reflections, ambient occlusion, floating dust particles, subtle volumetrics. Restrained, not flashy — everything should read as expensive, not as a VFX reel.

## STEP 6 — Signature Transition

At the sequence's climax: the watch freezes, then dissolves outward into fine metallic particles that spiral inward and reassemble into a handwritten signature. The signature glows softly. Below it, "Crafted Beyond Time." holds on screen for ~2 seconds.

Put the brand name, tagline, and signature asset behind a single `brand.config.ts` (or similar) rather than hardcoding them across components — makes it trivial to swap the final brand identity in one place later.

## STEP 7 — Transition Into Store

On continued scroll: the signature scales down and settles into the nav bar as the permanent logo, while the store fades upward into view underneath it. One continuous motion — no reload, no hard cut, it should feel like walking into a boutique.

---

## STEP 8 — Store Design System

Light mode, luxury editorial. Palette: white, ivory, stone, deep navy accent, muted gold accent. Generous whitespace, minimal layout, premium typography (Cormorant Garamond for display, Inter for body/UI). Large editorial imagery, elegant product cards, restrained hover animation.

**Homepage sections:** Hero · Featured Collection · New Arrivals · Brand Story · Craftsmanship · Best Sellers · Lifestyle Gallery · Testimonials · Newsletter · Footer. Each section gets its own scroll-triggered entrance animation, not a repeated fade-in template.

---

## STEP 9 — Store Functionality (this is what makes it an actual store)

- **Catalog:** products with variants (e.g. strap material/color, case size), pricing, and stock, served from Supabase. Collection pages support filter/sort.
- **Product page:** immersive gallery, sticky purchase panel, add-to-cart, craftsmanship timeline, materials, shipping/returns copy, related watches, reviews.
- **Cart:** persisted per session; merges into the account's cart on login. Stock is checked/decremented on successful order, not on add-to-cart.
- **Checkout:** Stripe Checkout Session → webhook confirms payment → order written to Supabase → confirmation email sent.
- **Accounts:** Supabase Auth (email/password or magic link) for sign-up/login, order history, saved addresses.

---

## Micro-interactions

Magnetic buttons, hover glow, custom cursor, animated underlines, glass navigation, image tilt-on-hover, smooth page transitions, soft easing throughout. Should feel handcrafted, not templated.

## Performance & Accessibility

60fps target for the 3D scene. Lazy-load below-the-fold sections and images. Code-split the R3F canvas away from the main bundle. SEO metadata on every route. WCAG-compliant color contrast and keyboard navigation even though the intro is scroll-driven — provide a "skip intro" affordance for accessibility and for anyone returning to the site.

## Mobile

The cinematic intro must run on mobile too: adapt camera framing for portrait aspect ratios, reduce particle counts if needed to hold frame rate, no broken or skipped animation states.

---

## Folder Structure

```
/app                    → Next.js routes
/components
  /three                → R3F scene, camera rigs, materials
  /animations            → GSAP/ScrollTrigger sequences
  /ui                    → shadcn-based primitives
  /store                 → cart, product card, checkout UI
/hooks
/lib
  /supabase             → client.ts, server.ts, queries
  /stripe
  brand.config.ts
/public
  /models                → hero-watch.glb
  /textures
/supabase
  /migrations
wrangler.toml
DEPLOYMENT.md
.env.example
```

## Code Quality

Type-safe throughout. Reusable, composable components. Comment non-obvious logic (especially the ScrollTrigger timeline math and the Stripe webhook flow). No placeholder or unfinished components — everything shipped should run end to end, including a fully clickable local checkout using Stripe test mode.

---

## North Star

The finished site should make a visitor feel like they've walked into a boutique, not landed on an online store — a ~15–20 second cinematic open that then resolves into a genuinely usable, purchasable catalog. Every animation should communicate precision and restraint, and every part of the actual store (cart, checkout, accounts) should work end to end against local Supabase + Stripe test mode before any cloud account is created.
