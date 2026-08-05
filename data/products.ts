import type { Collection, Product } from "@/lib/types";

const IMG = {
  steel: ["/products/shot-angle.webp", "/products/shot-front.webp", "/products/shot-profile.webp", "/products/shot-bracelet.webp", "/products/shot-caseback.webp"],
  gold: ["/products/watch-gold.webp", "/products/shot-crown.webp", "/products/shot-front.webp", "/products/watch-gold-crown.webp"],
  rose: ["/products/watch-rose.webp", "/products/shot-angle.webp", "/products/shot-crown.webp"],
  navy: ["/products/watch-navy.webp", "/products/shot-profile.webp", "/products/shot-front.webp"],
  bronze: ["/products/watch-bronze.webp", "/products/shot-angle.webp", "/products/shot-profile.webp"],
};

const review = (
  id: string,
  author: string,
  rating: number,
  title: string,
  body: string,
  date = "2025-11-04"
) => ({ id, author, rating, title, body, date });

export const collections: Collection[] = [
  {
    slug: "meridian",
    name: "Meridian",
    eyebrow: "The quintessential collection",
    description:
      "Steel cases, hand-finished dials, and a precision born in the workshop. The Meridian is INFINITY's point of entry — and its point of reference.",
    heroImage: "/products/shot-angle.webp",
  },
  {
    slug: "nocturne",
    name: "Nocturne",
    eyebrow: "Dressed in shadow",
    description:
      "High-contrast, bold, and quietly theatrical. Nocturne pairs midnight dials with applied gold indices and sweeping seconds in deep anthracite.",
    heroImage: "/products/watch-navy.webp",
  },
  {
    slug: "serie-limitee",
    name: "Série Limitée",
    eyebrow: "Small series, numbered",
    description:
      "No more than fifty of each. Each piece engraved with its own number, finished by a single maker from crown to clasp.",
    heroImage: "/products/watch-gold.webp",
  },
  {
    slug: "aurora",
    name: "Aurora",
    eyebrow: "Companion to the day",
    description:
      "Proportioned for the wrist, luminous in spirit. Aurora is our collection for those who dress light and live long.",
    heroImage: "/products/watch-rose.webp",
  },
];

export const products: Product[] = [
  {
    id: "P-001",
    slug: "meridian-one",
    name: "Meridian One",
    subtitle: "Cal. A1 · Silver opaline",
    collection: "meridian",
    collectionLabel: "Meridian",
    priceCents: 490000,
    currency: "USD",
    tagline: "The point of reference.",
    description:
      "Our definitive dress watch: a 40mm steel case, a silver opaline dial, and the self-winding Calibre A1 finished to chronometer tolerance.",
    longDescription:
      "The Meridian One is where the house began. Its case is machined from a single billet of 904L steel, hand-bevelled, and closed by a sapphire caseback that reveals the rose-gold rotor sweeping beneath. The dial carries no date — only time, uninterrupted. We believe restraint is the rarest form of luxury.",
    images: IMG.steel,
    bestseller: true,
    variants: [
      { id: "V1", name: "Steel bracelet", priceCents: 490000, stock: 14 },
      { id: "V2", name: "Anthracite strap", priceCents: 480000, stock: 22 },
      { id: "V3", name: "Ivory strap", priceCents: 480000, stock: 18 },
    ],
    specs: [
      { label: "Case", value: "40mm · 904L steel" },
      { label: "Movement", value: "Calibre A1 · automatic" },
      { label: "Reserve", value: "70 hours" },
      { label: "Water", value: "100m" },
      { label: "Crystal", value: "Box sapphire, 6x AR" },
    ],
    reviews: [
      review("R1", "Julien M.", 5, "Exceptional restraint", "No logo noise, no exhibition fuss. Just a flawless machine on the wrist."),
      review("R2", "Stefania K.", 5, "The bracelet is unreal", "Clasp alignment is flawless and the taper is pure class."),
    ],
  },
  {
    id: "P-002",
    slug: "meridian-date",
    name: "Meridian Date",
    subtitle: "Calibre A1-D · 40mm",
    collection: "meridian",
    collectionLabel: "Meridian",
    priceCents: 560000,
    currency: "USD",
    tagline: "Time, with a practical flourish.",
    description: "The compensated date at three, framed in a printed railway track. Everything else — silent.",
    longDescription:
      "A perfectly legible date window, in a case that remains a statement of quiet. The Meridian Date is the One, plus the one small indulgence.",
    images: IMG.steel,
    variants: [
      { id: "D1", name: "Steel bracelet", priceCents: 560000, stock: 9 },
      { id: "D2", name: "Navy strap", priceCents: 550000, stock: 26 },
    ],
    specs: [
      { label: "Case", value: "40mm · 904L steel" },
      { label: "Movement", value: "Calibre A1-D4 · automatic" },
      { label: "Reserve", value: "70 hours" },
      { label: "Water", value: "100m" },
    ],
    reviews: [review("R3", "Omar T.", 4, "Great value", "The date is perfectly legible, the finishing superb.")],
  },
  {
    id: "P-003",
    slug: "nocturne-41",
    name: "Nocturne 41",
    subtitle: "Calibre N5 · midnight dial",
    collection: "nocturne",
    collectionLabel: "Nocturne",
    priceCents: 675000,
    currency: "USD",
    tagline: "Dressed in shadow.",
    description:
      "A midnight lacquer dial with rose-gold indices and a seconds hand that catches every flicker of light.",
    longDescription:
      "Nocturne is the house after dark. The dial is lacquered blue-black and sunray-brushed until it reads as velvet, then anchored with applied rose-gold batons. The casewear is sculpted to hold its own under candlelight and stage light alike.",
    images: IMG.navy,
    bestseller: true,
    newArrival: true,
    variants: [
      { id: "N1", name: "Midnight dial · bracelet", priceCents: 675000, stock: 12 },
      { id: "N2", name: "Midnight dial · navy strap", priceCents: 665000, stock: 21 },
    ],
    specs: [
      { label: "Case", value: "41mm · steel, rose-gold pins" },
      { label: "Movement", value: "Calibre N5 · automatic" },
      { label: "Reserve", value: "72 hours" },
      { label: "Water", value: "200m" },
    ],
    reviews: [review("R4", "Victor L.", 5, "Velvet under glass", "The dial depth is unlike anything in this class.")],
  },
  {
    id: "P-004",
    slug: "nocturne-squelette",
    name: "Nocturne Squelette",
    subtitle: "Calibre N9-S · skeleton",
    collection: "nocturne",
    collectionLabel: "Nocturne",
    priceCents: 1290000,
    currency: "USD",
    compareAtPriceCents: 1390000,
    tagline: "Time, opened to the light.",
    description:
      "A fully skeletonised movement, hand-bevelled across 138 edges, floating above a midnight-blue mainplate.",
    longDescription:
      "We skeletonise every plate and bridge of the N9 by hand — then re-arrange the hours in an open-worked ring so the architecture is never obscured. Two dial-less years of development; fifty pieces a year.",
    images: IMG.navy,
    newArrival: true,
    variants: [
      { id: "S1", name: "Platinum case", priceCents: 1290000, stock: 3 },
      { id: "S2", name: "Steel case", priceCents: 1120000, stock: 7 },
    ],
    specs: [
      { label: "Case", value: "41mm · platinum 950 / steel" },
      { label: "Movement", value: "Calibre N9 · skeleton" },
      { label: "Reserve", value: "80 hours" },
      { label: "Made", value: "One per fortnight" },
    ],
    reviews: [review("R5", "Anya D.", 5, "Art deco science", "Close to a minute reel of it under a loupe.")],
  },
  {
    id: "P-005",
    slug: "serie-limitee-rose",
    name: "Série Limitée — Rosé",
    subtitle: "Numbered · 050 pieces",
    collection: "serie-limitee",
    collectionLabel: "Série Limitée",
    priceCents: 840000,
    currency: "USD",
    tagline: "Fifty pieces. One signature.",
    description:
      "A rose-gold case, coral dial, and hand-painted spheres. Each example engraved with its number and a single initial.",
    longDescription:
      "For the Série Limitée we set our own limits. Fifty movements, adjusted and signed by the watchmaker who finished them. The coral lacquered dial wears a heat-blued sweep hand kept silent until water. When the edition closes, the lineage closes with it.",
    images: IMG.rose,
    newArrival: true,
    variants: [{ id: "R1", name: "Rose gold · coral", priceCents: 840000, stock: 2 }],
    specs: [
      { label: "Case", value: "39mm · rose gold" },
      { label: "Movement", value: "Calibre S2 · manual" },
      { label: "Reserve", value: "100 hours" },
      { label: "Edition", value: "No. 14/50" },
    ],
    reviews: [review("R6", "Klara B.", 5, "A numbered heirloom", "Feels like it was made for a museum.")],
  },
  {
    id: "P-006",
    slug: "serie-limitee-bronze",
    name: "Série Limitée — Bronze",
    subtitle: "CuSn8 · 25 pieces",
    collection: "serie-limitee",
    collectionLabel: "Série Limitée",
    priceCents: 720000,
    currency: "USD",
    tagline: "It will take on the years gracefully.",
    description:
      "A CuAl bronze case that slowly takes a personal patina. Numbered caseback, green dial river.",
    longDescription:
      "Bronze is a material only for the patient. We use a cupronickel alloy that develops a warm, organic patina unique to every owner. The dial is a deep eucalyptus green with applied gold indices and a caseback engraved with the owner's initials.",
    images: IMG.bronze,
    newArrival: true,
    variants: [{ id: "B1", name: "CuAl bronze", priceCents: 720000, stock: 4 }],
    specs: [
      { label: "Case", value: "40mm · CuAl bronze" },
      { label: "Movement", value: "Calibre S3 · automatic" },
      { label: "Reserve", value: "70 hours" },
    ],
    reviews: [],
  },
  {
    id: "P-007",
    slug: "aurora-38",
    name: "Aurora 38",
    subtitle: "Calibre A2 · 38mm",
    collection: "aurora",
    collectionLabel: "Aurora",
    priceCents: 510000,
    currency: "USD",
    tagline: "Light, proportioned.",
    description:
      "A rose-gold-flushed 38mm case with a champagne dial. The Aurora is our most intimate watch.",
    longDescription:
      "In cities the wrist still wants subtlety. The Aurora 38 wears like a jewel and tells time like an instrument — rose-gold hands over a champagne dial, end links sculpted to drape, and a movement slender enough to disappear under a cuff.",
    images: IMG.rose,
    bestseller: true,
    variants: [
      { id: "A1", name: "Rose-tinted steel", priceCents: 510000, stock: 16 },
      { id: "A2", name: "Ivory strap", priceCents: 500000, stock: 24 },
    ],
    specs: [
      { label: "Case", value: "38mm · light steel" },
      { label: "Movement", value: "Calibre A2 · automatic" },
      { label: "Reserve", value: "62 hours" },
    ],
    reviews: [review("A9", "Lena S.", 5, "A quiet masterpiece", "Subtle, serious, and somehow still glamorous.")],
  },
  {
    id: "P-008",
    slug: "heritage-monogram",
    name: "Heritage Monogram",
    subtitle: "Calibre A1-G · engraved",
    collection: "aurora",
    collectionLabel: "Aurora",
    priceCents: 1170000,
    currency: "USD",
    tagline: "An heirloom relook.",
    description:
      "A hand-engraved gold crown, engraved caseband, and a two-tone display that echoes the archives.",
    longDescription:
      "We borrowed nothing from the past except its patience. The Heritage Monogram pairs a hand-engraved rose-gold crown with a warm silver dial and applied gold numerals, and the whole case is polished for three hours before it leaves.",
    images: IMG.gold,
    variants: [
      { id: "H1", name: "Gold bracelet", priceCents: 1190000, stock: 6 },
      { id: "H2", name: "Black strap", priceCents: 1170000, stock: 10 },
    ],
    specs: [
      { label: "Case", value: "40mm · gold-capped steel" },
      { label: "Movement", value: "Calibre A1-G · automatic" },
      { label: "Reserve", value: "70 hours" },
    ],
    reviews: [],
  },
  {
    id: "P-009",
    slug: "nocturne-chronograph",
    name: "Nocturne Chronograph",
    subtitle: "Calibre N7-C · column wheel",
    collection: "nocturne",
    collectionLabel: "Nocturne",
    priceCents: 980000,
    currency: "USD",
    tagline: "Measured in tenths.",
    description:
      "A column-wheel chronograph whose counters are arranged with a lateral clutch — and a bracelet styled for the dark.",
    longDescription:
      "Few column-wheel chronographs remain at this price; fewer still are this legible. The Nocturne Chronograph uses our in-house N7-C with a vertical clutch, and offers a 12-hour totaliser framed in midnight. Shielded from light and errant magnetic fields, it is the tool-watch of the evening.",
    images: IMG.navy,
    bestseller: true,
    variants: [
      { id: "C1", name: "Midnight · steel bracelet", priceCents: 980000, stock: 8 },
      { id: "C2", name: "Midnight · leather", priceCents: 965000, stock: 14 },
    ],
    specs: [
      { label: "Case", value: "41mm · 904L steel" },
      { label: "Movement", value: "Calibre N7-C · column wheel" },
      { label: "Reserve", value: "72 hours" },
      { label: "Water", value: "200m" },
    ],
    reviews: [review("C3", "Tomasz F.", 4, "The counters are poetry", "Wear it dark, keep it running.")],
  },
  {
    id: "P-010",
    slug: "meridian-gmt",
    name: "Meridian GMT",
    subtitle: "Calibre A5 · true GMT",
    collection: "meridian",
    collectionLabel: "Meridian",
    priceCents: 890000,
    currency: "USD",
    compareAtPriceCents: 940000,
    tagline: "Two cities, one wrist.",
    description:
      "A jumping, true local GMT with an inscribed 24-hour ring — made indifferent to your timezone.",
    longDescription:
      "The GMT is the traveller's Meridian. The central jumping home hand is set against a printed 24-hour flange; a polished frame keeps the rotating bezel rigid. It crosses time zones with the indifference of a good airline bartender.",
    images: IMG.steel,
    variants: [
      { id: "G1", name: "Steel bracelet", priceCents: 890000, stock: 11 },
      { id: "G2", name: "Travel strap", priceCents: 880000, stock: 19 },
    ],
    specs: [
      { label: "Case", value: "41mm · 904L steel" },
      { label: "Movement", value: "Calibre A2-G · true GMT" },
      { label: "Reserve", value: "70 hours" },
    ],
    reviews: [],
  },
  {
    id: "P-011",
    slug: "aurora-midnight",
    name: "Aurora — Midnight",
    subtitle: "Calibre M2 · 37mm",
    collection: "aurora",
    collectionLabel: "Aurora",
    priceCents: 690000,
    currency: "USD",
    tagline: "The small hours, small.",
    description:
      "A 37mm midnight-dialed variant that catches slipped in, two-hand minimum, yet reads at a glance across theatres.",
    longDescription:
      "The Aurora at midnight. In a cinema it reads like newsprint. A sapphire case of 37mm and a two-hand gold-spoken manual-wind that asks you to remember it each evening — a ritual, if you keep time near.",
    images: IMG.navy,
    newArrival: true,
    variants: [{ id: "M1", name: "Midnight · band", priceCents: 690000, stock: 5 }],
    specs: [
      { label: "Case", value: "37mm" },
      { label: "Movement", value: "Calibre M2 · manual" },
      { label: "Reserve", value: "58 hours" },
    ],
    reviews: [],
  },
  {
    id: "P-012",
    slug: "nocturne-noir",
    name: "Nocturne Noir",
    subtitle: "Cintré · 44mm",
    collection: "nocturne",
    collectionLabel: "Nocturne",
    priceCents: 775000,
    currency: "USD",
    tagline: "Theatre of the wrist.",
    description:
      "A convex, almost black 44mm case with a stepped bezel, and a dial that disappears into the case at its edges.",
    longDescription:
      "Noir is the house's dark matter. It swallows light at its dial edges, which draws the hand to the middle where a single gold sweep runs. A restrained case — anti-dome and anti-glare — that still catches every streetlight it passes.",
    images: IMG.navy,
    variants: [{ id: "NO1", name: "Black bracelet", priceCents: 775000, stock: 6 }],
    specs: [
      { label: "Case", value: "44mm convex" },
      { label: "Movement", value: "Calibre N11 · automatic" },
      { label: "Water", value: "200m" },
    ],
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