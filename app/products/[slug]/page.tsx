import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { PurchasePanel } from "@/components/store/purchase-panel";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductCard } from "@/components/store/product-card";
import { Container, Eyebrow, Rating } from "@/components/ui/primitives";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";

export const dynamicParams = true;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug, 3);

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <div className="pt-24" />

      {/* Breadcrumb */}
      <Container>
        <nav className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-smoke" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Maison</Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-ink">Collection</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </Container>

      {/* Product layout */}
      <section className="mt-8">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          <ProductGallery product={product} />
          <div className="lg:sticky lg:top-28 lg:self-start lg:pb-10">
            <PurchasePanel product={product} />
          </div>
        </Container>
      </section>

      {/* Specs + craftsmanship */}
      <section className="mt-24 border-t border-ink/10 bg-parchment py-20">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div data-reveal>
            <Eyebrow>Specifications</Eyebrow>
            <dl className="mt-6 divide-y divide-ink/10">
              {product.specs.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="font-body text-[11px] uppercase tracking-[0.25em] text-smoke">{s.label}</dt>
                  <dd className="text-right font-body text-sm text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-reveal data-reveal-delay="100">
            <Eyebrow>Maison</Eyebrow>
            <h2 className="mt-4 font-display text-3xl leading-snug text-ink">
              Why we made it this way
            </h2>
            <p className="mt-5 font-body text-base leading-relaxed text-smoke">
              {product.longDescription}
            </p>
            <div className="mt-8">
              <Eyebrow className="text-gold">Craft, in one line</Eyebrow>
              <p className="mt-3 font-signature text-3xl text-ink">&ldquo;{product.tagline}&rdquo;</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Reviews */}
      <section className="bg-ivory py-20">
        <Container className="max-w-3xl">
          <div data-reveal className="flex items-end justify-between gap-6 border-b border-ink/10 pb-6">
            <Eyebrow>Owner notes</Eyebrow>
            <span className="font-body text-sm text-smoke">
              {product.reviews.length > 0
                ? `${product.reviews.length} verified`
                : "First reviews are on their way"}
            </span>
          </div>
          <div className="mt-8 space-y-8">
            {product.reviews.length === 0 ? (
              <p className="font-body text-sm text-smoke">
                We publish every review we receive — the first one for this piece is being written now.
              </p>
            ) : (
              product.reviews.map((r, i) => (
                <article key={r.id} data-reveal data-reveal-delay={i * 80} className="border-b border-ink/10 pb-8 last:border-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone font-display text-lg text-ink">
                        {r.author.charAt(0)}
                      </span>
                      <div>
                        <p className="font-body text-sm font-medium text-ink">{r.author}</p>
                        <p className="font-body text-[11px] uppercase tracking-wider text-smoke">{r.date}</p>
                      </div>
                    </div>
                    <Rating value={r.rating} />
                  </div>
                  <h3 className="mt-4 font-display text-xl text-ink">{r.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-smoke">{r.body}</p>
                </article>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* Related */}
      <section className="border-t border-ink/10 bg-ivory py-20">
        <Container>
          <div data-reveal className="flex items-end justify-between border-b border-ink/10 pb-6">
            <h2 className="font-display text-3xl md:text-4xl">You may also keep</h2>
            <Link href="/collection" className="link-underline hidden shrink-0 font-body text-[11px] uppercase tracking-[0.3em] text-ink/70 md:block">
              Browse all
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 90} />
            ))}
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}