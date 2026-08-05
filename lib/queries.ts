import { collections, products, getProductBySlug, getRelatedProducts } from "@/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { CollectionSlug, Product } from "@/lib/types";

export { collections, getProductBySlug, getRelatedProducts };

/** True when live Supabase env vars are set; otherwise we serve the seed catalog. */
export const liveData = isSupabaseConfigured();

/** Supabase row shapes (snake_case) for the live catalog path. */
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  collection_id: string | null;
  collection?: { slug: string; name: string } | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  tagline: string | null;
  description: string;
  long_description: string | null;
  images: string[];
  specs: { label: string; value: string }[];
  bestseller: boolean;
  new_arrival: boolean;
  published: boolean;
  stock: number;
}

interface VariantRow {
  id: string;
  product_id: string;
  name: string;
  price_cents: number;
  stock: number;
}

interface ReviewRow {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  date: string | null;
  title: string | null;
  body: string;
}

function toProduct(row: ProductRow, variants: VariantRow[], reviews: ReviewRow[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle ?? "",
    collection: (row.collection?.slug ?? "meridian") as CollectionSlug,
    collectionLabel: row.collection?.name ?? "",
    priceCents: row.price_cents,
    compareAtPriceCents: row.compare_at_price_cents ?? undefined,
    currency: "USD",
    tagline: row.tagline ?? "",
    description: row.description,
    longDescription: row.long_description ?? "",
    images: row.images ?? [],
    variants: variants
      .filter((v) => v.product_id === row.id)
      .map((v) => ({ id: v.id, name: v.name, priceCents: v.price_cents, stock: v.stock })),
    bestseller: row.bestseller,
    newArrival: row.new_arrival,
    specs: row.specs ?? [],
    reviews: reviews
      .filter((r) => r.product_id === row.id)
      .map((r) => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        date: r.date ?? "",
        title: r.title ?? "",
        body: r.body,
      })),
  };
}

async function fetchLiveProducts(): Promise<Product[]> {
  const sb = await import("@/lib/supabase/client");
  const client = sb.getSupabaseBrowser();
  if (!client) return [];
  const { data: rows, error } = await client
    .from("products")
    .select("*, collection:collections(slug, name)")
    .eq("published", true);
  if (error || !rows || rows.length === 0) return [];
  const ids = (rows as ProductRow[]).map((r) => r.id);
  const [vRes, rRes] = await Promise.all([
    client
      .from("product_variants")
      .select("id, product_id, name, price_cents, stock")
      .in("product_id", ids),
    client
      .from("reviews")
      .select("id, product_id, author, rating, date, title, body")
      .in("product_id", ids),
  ]);
  const variants = (vRes.data ?? []) as VariantRow[];
  const reviews = (rRes.data ?? []) as ReviewRow[];
  return (rows as ProductRow[]).map((r) => toProduct(r, variants, reviews));
}

function sortProducts(list: Product[], sort?: string) {
  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      list.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "newest":
      list.sort((a, b) => Number(Boolean(b.newArrival)) - Number(Boolean(a.newArrival)));
      break;
    default:
      list.sort((a, b) => Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)));
  }
}

function filterList(list: Product[], options?: {
  collection?: CollectionSlug;
  search?: string;
}) {
  let out = list;
  if (options?.collection) {
    out = out.filter((p) => p.collection === options.collection);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.collectionLabel.toLowerCase().includes(q)
    );
  }
  return out;
}

export async function fetchProducts(options?: {
  collection?: CollectionSlug;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  search?: string;
}): Promise<Product[]> {
  if (liveData) {
    const live = await fetchLiveProducts();
    if (live.length) {
      const list = filterList(live, options);
      sortProducts(list, options?.sort);
      return list;
    }
  }

  // Seed fallback — keeps the storefront fully functional without Supabase.
  const list = filterList([...products], options);
  sortProducts(list, options?.sort);
  return list;
}
