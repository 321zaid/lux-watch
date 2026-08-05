import type { Collection, Product } from "@/lib/types";

const S3 = "https://hldgqsutdgozdnhexpys.supabase.co/storage/v1/object/public/products";

const img = (name: string) => `${S3}/${name}`;

export const collections: Collection[] = [
  {
    slug: "tissot",
    name: "Tissot",
    eyebrow: "Swiss heritage since 1853",
    description:
      "Swiss precision, honest prices, worn well. From the Carson to the PRX, the Tissot line is the everyday side of fine watchmaking.",
    heroImage: img("tissot-gentleman-quartz.png"),
  },
  {
    slug: "tag-heuer",
    name: "Tag Heuer",
    eyebrow: "Avant-garde timing",
    description:
      "The Aquaracer line — engineered for the deep, styled for the city. A diving tool that never stopped dressing up.",
    heroImage: img("tag-heuer-aquaracer-professional.png"),
  },
];

const specs = (...rows: [string, string][]) =>
  rows.map(([label, value]) => ({ label, value }));

const one = (id: string, priceCents: number) => [
  { id, name: "Standard", priceCents, stock: 8 },
];

export const products: Product[] = [
  {
    id: "P-001",
    slug: "tissot-carson-premium-ladies",
    name: "Tissot Carson Premium Ladies",
    subtitle: "T122.210.11.033.00 · 30mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 134300,
    currency: "USD",
    tagline: "A women's timeless choice.",
    description:
      "A classic 30mm ladies' watch in polished stainless steel with a silver dial — quiet, elegant, and built to be worn daily.",
    longDescription:
      "The Carson Premium Ladies pairs a compact 30mm stainless steel case with a clean silver dial and a matching steel bracelet. At 70 grams it sits weightlessly on the wrist, powered by a reliable Swiss quartz movement that keeps it accurate for years with no more than a battery change.",
    images: [img("tissot-carson-premium-ladies.png")],
    variants: one("V1", 134300),
    specs: specs(
      ["Model", "T122.210.11.033.00"],
      ["Movement", "Quartz"],
      ["Diameter", "30mm"],
      ["Dial", "Silver"],
      ["Weight", "70g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
  {
    id: "P-002",
    slug: "tissot-seastar-chronograph-black",
    name: "Tissot Seastar Chronograph",
    subtitle: "T120.417.11.051.01 · 45.5mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 172900,
    currency: "USD",
    tagline: "Sporty performance along timeless luxury.",
    description:
      "A black-dialed diving chronograph from the Seastar line — bold, water-ready, and finished like a much more expensive watch.",
    longDescription:
      "The Seastar Chronograph brings 300m water resistance, a unidirectional bezel, and a quartz chronograph movement into a rugged 45.5mm steel case. The black dial reads clearly in deep water and bright sunlight alike, and the steel bracelet keeps the whole 180-gram package securely planted.",
    images: [img("tissot-seastar-chronograph-black.png")],
    bestseller: true,
    variants: one("V2", 172900),
    specs: specs(
      ["Model", "T120.417.11.051.01"],
      ["Movement", "Quartz Chronograph"],
      ["Diameter", "45.5mm"],
      ["Dial", "Black"],
      ["Weight", "180g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
  {
    id: "P-003",
    slug: "tag-heuer-aquaracer-professional",
    name: "Tag Heuer Aquaracer Professional 300",
    subtitle: "WBP201B.BA0632 · 43mm",
    collection: "tag-heuer",
    collectionLabel: "Tag Heuer",
    priceCents: 554200,
    currency: "USD",
    tagline: "Built for 300 metres. Worn everywhere.",
    description:
      "A 43mm professional diver with a blue sunray dial, ceramic bezel, and the Calibre 5 automatic — the definitive Aquaracer.",
    longDescription:
      "The Aquaracer Professional 300 Date is Tag Heuer's modern dive watch. A scratch-resistant blue ceramic unidirectional bezel frames a sunray-brushed dial with horizontal deck-style lines, driven by the self-winding Calibre 5 with a ~38-hour power reserve. The fine-brushed steel bracelet closes with a double-safety push-button folding clasp.",
    images: [img("tag-heuer-aquaracer-professional.png")],
    bestseller: true,
    newArrival: true,
    variants: one("V3", 554200),
    specs: specs(
      ["Model", "WBP201B.BA0632"],
      ["Movement", "Calibre 5 Automatic Swiss"],
      ["Diameter", "43mm"],
      ["Dial", "Blue sunray"],
      ["Weight", "~175g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel · blue ceramic bezel"]
    ),
    reviews: [],
  },
  {
    id: "P-004",
    slug: "tissot-pr100-chronograph",
    name: "Tissot PR100 Chronograph",
    subtitle: "T101.417.22.031.00 · 41mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 144500,
    currency: "USD",
    tagline: "Classic silver & refined gold.",
    description:
      "A two-tone chronograph — silver dial, gold-tone accents, and a 41mm steel case that bridges sport and dress.",
    longDescription:
      "The PR100 Chronograph offers everything a first chronograph should: three readable counters, a date window, and a two-tone silver-and-gold finish that works from the boardroom to the weekend. The quartz chronograph movement keeps it fuss-free and accurate.",
    images: [img("tissot-pr100-chronograph.png")],
    variants: one("V4", 144500),
    specs: specs(
      ["Model", "T101.417.22.031.00"],
      ["Movement", "Quartz Chronograph"],
      ["Diameter", "41mm"],
      ["Dial", "Silver"],
      ["Weight", "145g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
  {
    id: "P-005",
    slug: "tissot-gentleman-quartz",
    name: "Tissot Gentleman Quartz",
    subtitle: "T127.410.11.041.00 · 40mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 132400,
    currency: "USD",
    tagline: "Elegant, timeless & quiet luxury.",
    description:
      "A 40mm blue-dialed daily in polished steel — the quiet-luxury GADA watch, accurate to the second.",
    longDescription:
      "The Gentleman is the modern definition of quiet luxury: a 40mm polished case, a deep blue dial, and a Swiss quartz movement accurate to ±10 seconds a year. At 142 grams it has a reassuring presence without ever shouting, and its fine-brushed bracelet sits flat and comfortable.",
    images: [img("tissot-gentleman-quartz.png")],
    newArrival: true,
    variants: one("V5", 132400),
    specs: specs(
      ["Model", "T127.410.11.041.00"],
      ["Movement", "Quartz"],
      ["Diameter", "40mm"],
      ["Dial", "Blue"],
      ["Weight", "142g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
  {
    id: "P-006",
    slug: "tissot-traditional-chronograph",
    name: "Tissot Traditional Chronograph",
    subtitle: "T063.617.36.037.00 · 42mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 140400,
    currency: "USD",
    tagline: "Light weight, simple & elegant.",
    description:
      "A featherweight 42mm chronograph on a leather belt — simple, elegant, and almost unnoticeable on the wrist.",
    longDescription:
      "At just 67 grams, the Traditional Chronograph is one of the lightest chronographs you'll wear. Its white dial and slim steel case keep things dressy, while the genuine leather strap adds warmth. A quartz movement keeps the three counters and date honest.",
    images: [img("tissot-traditional-chronograph.png")],
    variants: one("V6", 140400),
    specs: specs(
      ["Model", "T063.617.36.037.00"],
      ["Movement", "Quartz"],
      ["Diameter", "42mm"],
      ["Dial", "White"],
      ["Weight", "67g"],
      ["Bracelet", "Leather"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
  {
    id: "P-007",
    slug: "tissot-seastar-chronograph-blue",
    name: "Tissot Seastar Chronograph",
    subtitle: "T120.417.11.041.01 · 45.5mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 172900,
    currency: "USD",
    tagline: "Sporty performance along timeless luxury.",
    description:
      "The same 300m-ready Seastar chronograph, now in a blue-gradient dial that shifts from deep navy to bright blue.",
    longDescription:
      "A gradient blue dial elevates the Seastar Chronograph from tool to statement. The 45.5mm steel case, ceramic bezel, and quartz chronograph remain, but the dial — dark at the edges, glowing at the centre — catches the light with every turn of the wrist.",
    images: [img("tissot-seastar-chronograph-blue.png")],
    variants: one("V7", 172900),
    specs: specs(
      ["Model", "T120.417.11.041.01"],
      ["Movement", "Quartz Chronograph"],
      ["Diameter", "45.5mm"],
      ["Dial", "Blue gradient"],
      ["Weight", "180g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
  {
    id: "P-008",
    slug: "tissot-carson-chronograph",
    name: "Tissot Carson Chronograph",
    subtitle: "T122.417.11.011.00 · 41mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 166100,
    currency: "USD",
    tagline: "Classic, refined & timeless.",
    description:
      "A white-dialed three-counter chronograph in polished steel — the Carson name, now with a stopwatch.",
    longDescription:
      "The Carson Chronograph takes the house's best-selling dress-watch DNA and adds three legible counters and a date. The white dial is framed by a polished 41mm steel case, and the whole piece walks the line between tool and formal without choosing.",
    images: [img("tissot-carson-chronograph.png")],
    bestseller: true,
    variants: one("V8", 166100),
    specs: specs(
      ["Model", "T122.417.11.011.00"],
      ["Movement", "Quartz"],
      ["Diameter", "41mm"],
      ["Dial", "White"],
      ["Weight", "113g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
  {
    id: "P-009",
    slug: "tissot-prx-quartz",
    name: "Tissot PRX Quartz",
    subtitle: "T137.410.11.041.00 · 40mm",
    collection: "tissot",
    collectionLabel: "Tissot",
    priceCents: 136700,
    currency: "USD",
    tagline: "The perfect blend of sport and sophistication.",
    description:
      "The integrated-bracelet icon — a dark-blue 40mm PRX with the instantly recognisable 1970s case.",
    longDescription:
      "The PRX's integrated steel case and bracelet are pure 1970s, and still the most recognisable silhouette Tissot makes. The dark-blue waffle dial is crisp under any light, powered by a Swiss quartz movement accurate to ±10 seconds a year. One watch, every occasion.",
    images: [img("tissot-gentleman-quartz.png")],
    newArrival: true,
    variants: one("V9", 136700),
    specs: specs(
      ["Model", "T137.410.11.041.00"],
      ["Movement", "Swiss Quartz"],
      ["Diameter", "40mm"],
      ["Dial", "Dark Blue"],
      ["Weight", "103g"],
      ["Bracelet", "Stainless Steel"],
      ["Case", "Stainless Steel"]
    ),
    reviews: [],
  },
];

/** CollectionMap by slug */
export const collectionLookup = new Map(
  collections.map((c) => [c.slug as string, c])
);

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, count = 3): Product[] {
  const p = getProductBySlug(slug);
  if (!p) return [];
  return products
    .filter((x) => x.slug !== slug && x.collection === p.collection)
    .concat(products.filter((x) => x.slug !== slug && x.collection !== p.collection))
    .slice(0, count);
}
