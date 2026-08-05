import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { ProductGrid } from "@/components/store/product-grid";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { collections } from "@/data/products";
import { brand } from "@/lib/brand.config";

export const metadata: Metadata = {
  title: "The Collection",
  description: "Browse the INFINITY collections — Meridian, Nocturne, Série Limitée and Aurora.",
};

export default function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; sort?: string; q?: string }>;
}) {
  return (
    <main className="min-h-screen bg-ivory pt-24">
      <Navbar />
      <Suspense fallback={null}>
        <CollectionContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </main>
  );
}

async function CollectionContent({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const active = sp.collection ?? "";
  const sort = sp.sort ?? "featured";
  const q = sp.q?.trim() ?? "";

  return (
    <>
      {/* Header */}
      <section className="border-b border-ink/10">
        <Container className="py-16 md:py-20">
          <Eyebrow>{q ? "Search" : "The boutique"}</Eyebrow>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">
            {q ? `“${q}”` : active ? collections.find((c) => c.slug === active)?.name ?? "Collection" : "All watches"}
          </h1>
          <p className="mt-4 max-w-xl font-body text-lg text-smoke">
            {q
              ? "Results of your search across the maison."
              : collections.find((c) => c.slug === active)?.description ??
                "Every model in the maison — numbered, hand-finished, made to be kept."}
          </p>
        </Container>
      </section>

      {/* Collection tabs */}
      <section className="border-b border-ink/10 bg-parchment">
        <Container className="no-scrollbar flex items-center gap-8 overflow-x-auto py-4">
          <TabLink active={!active && !q} href="/collection">
            All
          </TabLink>
          {collections.map((c) => (
            <TabLink key={c.slug} active={active === c.slug} href={`/collection?collection=${c.slug}`}>
              {c.name}
            </TabLink>
          ))}
        </Container>
      </section>

      <ProductGrid collection={active} sort={sort} query={q} />

      {/* Footer note */}
      <Container className="mt-16 border-t border-ink/10 py-12 text-center">
        <p className="font-body text-sm text-smoke">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/collection" className="link-underline text-ink">
            Write to the maison
          </Link>{" "}
          — every year we consider one or two commissions.
        </p>
        <p className="mt-2 font-body text-[10px] uppercase tracking-[0.3em] text-smoke">
          {brand.since} · Geneva
        </p>
      </Container>
    </>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 border-b-2 pb-1 font-body text-[11px] uppercase tracking-[0.25em] transition-colors ${
        active ? "border-gold text-ink" : "border-transparent text-smoke hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}