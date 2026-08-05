"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { products, collections } from "@/data/products";
import { ProductCard } from "@/components/store/product-card";
import { Eyebrow, Container } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toaster";
import { brand } from "@/lib/brand.config";

const featured = () => products.filter((p) => p.bestseller).slice(0, 3);
const newArrivals = () => products.filter((p) => p.newArrival);
const bestSellers = () => products.filter((p) => p.bestseller).slice(0, 4);

export function StoreHomeSections() {
  const featuredList = featured();
  const arrivals = newArrivals().slice(0, 5);
  const sellers = bestSellers();

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-t border-ink/10 bg-ivory">
        <Container className="grid min-h-[92vh] grid-cols-1 items-center gap-10 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-6">
            <p data-reveal className="flex items-center gap-3 font-body text-[11px] uppercase tracking-[0.4em] text-gold">
              <span className="h-px w-10 bg-gold/60" aria-hidden />
              Independent horology · Geneva
            </p>
            <h1
              data-reveal
              data-reveal-delay="80"
              className="mt-6 font-display text-5xl leading-[1.02] text-ink sm:text-6xl lg:text-[5.2rem]"
            >
              <span className="block font-light">The craft of</span>
              <span className="block italic">time, kept</span>
              <span className="block text-shimmer">precise.</span>
            </h1>
            <p data-reveal data-reveal-delay="160" className="mt-8 max-w-md font-body text-lg leading-relaxed text-smoke">
              Forty series are nothing next to a watch you pass to the next generation. We make ours in small
              numbered batches — and we make them to be kept.
            </p>
            <div data-reveal data-reveal-delay="240" className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/collection"
                className="group inline-flex items-center gap-3 bg-ink px-9 py-4 font-body text-[11px] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-graphite"
              >
                The collection
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#craft"
                className="inline-flex items-center gap-3 border-b border-ink/30 pb-1 font-body text-[11px] uppercase tracking-[0.28em] text-ink hover:border-gold hover:text-gold-dark"
              >
                The workshop
              </Link>
            </div>
          </div>

          {/* Editorial image stack */}
          <div className="relative lg:col-span-6">
<div className="relative mx-auto max-w-md lg:max-w-none" data-reveal data-reveal-delay="120">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/products/shot-front.webp"
              alt="INFINITY Meridian One watch"
              className="mx-auto w-full max-w-sm object-contain mix-blend-multiply lg:max-w-md"
            />
            <div className="absolute -left-4 top-10 hidden rotate-2 border border-ink/10 bg-ivory px-5 py-4 shadow-sm lg:block" aria-hidden>
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-smoke">Dial</p>
              <p className="font-display text-2xl text-ink">Opaline</p>
            </div>
            <div className="absolute -right-2 bottom-16 hidden -rotate-3 border border-ink/10 bg-ivory px-5 py-4 shadow-sm lg:block" aria-hidden>
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-smoke">Reserve</p>
              <p className="font-display text-2xl text-ink">70 h</p>
            </div>
          </div>
          </div>
        </Container>
      </section>

      {/* ============ FEATURED COLLECTION ============ */}
      <section className="bg-ivory">
        <Container>
          <div data-reveal className="flex items-end justify-between gap-6 border-b border-ink/10 pb-6">
            <div>
              <Eyebrow>Featured collection</Eyebrow>
              <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">The Icons</h2>
            </div>
            <Link href="/collection" className="link-underline hidden shrink-0 font-body text-[11px] uppercase tracking-[0.3em] text-ink/70 md:block">
              View all
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {featuredList.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 90} />
            ))}
          </div>
        </Container>
      </section>

      {/* ============ NEW ARRIVALS (drawer scroll row) ============ */}
      <section className="mt-28 bg-ink py-24 text-ivory">
        <Container>
          <div data-reveal className="flex items-center justify-between gap-6">
            <div>
              <Eyebrow className="text-gold-light">New this season</Eyebrow>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Arrivals</h2>
            </div>
            <Link href="/collection?sort=newest" className="link-underline hidden shrink-0 font-body text-[11px] uppercase tracking-[0.3em] text-ivory/60 md:block">
              See the season
            </Link>
          </div>
        </Container>
        <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 md:px-16">
          {arrivals.map((p) => (
            <div key={p.id} className="w-[78vw] max-w-[340px] shrink-0 snap-start">
              <Link href={`/products/${p.slug}`} className="group block overflow-hidden bg-ivory/5">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  width={680}
                  height={680}
                  loading="lazy"
                  className="aspect-square w-full object-contain p-6 mix-blend-screen transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-ivory">{p.name}</h3>
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-ivory/40">
                    {p.subtitle}
                  </p>
                </div>
                <ArrowUpRight size={18} className="text-gold" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ BRAND STORY ============ */}
      <section className="bg-ivory py-28">
        <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div data-reveal className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <Image src="/products/shot-crown.webp" alt="Hand-finished crown" width={560} height={700} className="mt-10 w-full bg-stone object-contain mix-blend-multiply" />
              <Image src="/products/watch-gold.webp" alt="Gold finishing" width={560} height={700} className="w-full bg-stone object-contain mix-blend-multiply" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Maison</Eyebrow>
            <h2 data-reveal data-reveal-delay="60" className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              We did not start with a <em className="italic">collection</em>.
              <br />
              We started with a discipline.
            </h2>
            <p data-reveal data-reveal-delay="140" className="mt-7 max-w-lg font-body text-lg leading-relaxed text-smoke">
              In a workshop that holds fewer people than our first series, we finish each movement by hand —
              anglage, perlage, and the kind of decisions that no camera can confirm and every owner can feel.
            </p>
            <div data-reveal data-reveal-delay="220" className="mt-10 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
              {[
                ["150h", "Finishing per movement"],
                ["14", "Makers in the maison"],
                ["05", "Series a year, numbered"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-4xl text-gold">{n}</p>
                  <p className="mt-1 font-body text-xs uppercase tracking-[0.18em] text-smoke">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============ CRAFTSMANSHIP ============ */}
      <section id="craft" className="border-y border-ink/10 bg-parchment py-28">
        <Container>
          <div data-reveal className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow className="justify-center">Craft</Eyebrow>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Three hundred and ninety</h2>
            <p className="mt-5 font-body text-lg text-smoke">
              The pieces of an INFINITY — and the hours that disappear inside them.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Steel, cut to light",
                d: "904L steel machined, milled, then hand-bevelled until the light stops at a line.",
              },
              {
                n: "02",
                t: "The dial, sunrayed",
                d: "each dial brushed nine times and lacquered, then aged in a kiln we built ourselves.",
              },
              {
                n: "03",
                t: "Adjusted in five positions",
                d: "every Calibre leaves the bench regulated in five positions — and signed by one name.",
              },
            ].map((s) => (
              <div key={s.n} data-reveal className="group bg-parchment p-10 transition-colors duration-500 hover:bg-ivory">
                <span className="font-display text-5xl text-gold/40">{s.n}</span>
                <h3 className="mt-8 font-display text-2xl text-ink">{s.t}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-smoke">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ BEST SELLERS ============ */}
      <section className="bg-ivory py-28">
        <Container>
          <div data-reveal className="flex items-end justify-between gap-6">
            <h2 className="font-display text-4xl md:text-5xl">The most-kept</h2>
            <Link href="/collection" className="link-underline hidden shrink-0 font-body text-[11px] uppercase tracking-[0.3em] text-ink/70 md:block">
              Browse all
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {sellers.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={(i + 1) * 80} />
            ))}
          </div>
        </Container>
      </section>

      {/* ============ COLLECTIONS INDEX ============ */}
      <section className="bg-ivory pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/collection?collection=${c.slug}`}
                className="group relative overflow-hidden bg-ivory"
              >
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden">
                  <Image
                    src={c.heroImage}
                    alt={c.name}
                    width={640}
                    height={853}
                    loading="lazy"
                    className="h-full w-full object-contain p-10 mix-blend-multiply transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-1"
                  />
                </div>
                <div className="p-6">
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">{c.eyebrow}</p>
                  <h3 className="mt-2 font-display text-2xl text-ink">{c.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="border-t border-ink/10 bg-ivory py-28">
        <Container className="max-w-4xl text-center">
          <p data-reveal className="font-body text-[11px] uppercase tracking-[0.4em] text-gold">
            From the owners
          </p>
          <div className="mt-10 space-y-14" data-reveal data-reveal-delay="120">
            <blockquote className="font-display text-3xl leading-snug text-ink md:text-4xl">
              “I have owned far costlier watches. This is the only one that made my father
              <span className="text-gold"> stop the room</span> to ask who made it.”
            </blockquote>
            <p className="font-body text-sm uppercase tracking-[0.25em] text-smoke">– J. M., Meridian One</p>
          </div>
        </Container>
      </section>

      {/* ============ NEWSLETTER BAND ============ */}
      <NewsletterBand />
    </>
  );
}

function NewsletterBand() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  return (
    <section className="bg-midnight py-20 text-ivory">
      <Container className="flex flex-col items-center text-center">
        <p data-reveal className="font-body text-[11px] uppercase tracking-[0.4em] text-gold-light">
          {brand.name} Journal
        </p>
        <h2 data-reveal data-reveal-delay="60" className="mt-4 font-display text-4xl md:text-5xl">
          A letter, now and again.
        </h2>
        <p data-reveal data-reveal-delay="140" className="mt-4 max-w-lg font-body text-smoke">
          New models, studio notes, and the occasional piece about mechanical time. Nothing monthly. Nothing spam.
        </p>
        <form
          data-reveal
          data-reveal-delay="220"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) return toast("Please enter a valid address", "error");
            toast("Welcome to the maison.");
            setEmail("");
          }}
          className="mt-8 flex w-full max-w-md items-center gap-4 border-b border-ivory/30 pb-3 focus-within:border-gold"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            aria-label="Email"
            className="w-full bg-transparent font-body text-base text-ivory outline-none placeholder:text-ivory/40"
          />
          <button type="submit" className="shrink-0 font-body text-[11px] uppercase tracking-[0.3em] text-gold-light hover:text-ivory">
            Subscribe
          </button>
        </form>
      </Container>
    </section>
  );
}