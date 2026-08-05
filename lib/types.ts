export type CollectionSlug =
  | "meridian"
  | "nocturne"
  | "serie-limitee"
  | "aurora";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1..5
  date: string;
  title: string;
  body: string;
}

export interface ProductVariant {
  id: string;
  name: string; // strap metal/color label
  priceCents: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  collection: CollectionSlug;
  collectionLabel: string;
  priceCents: number;
  compareAtPriceCents?: number;
  currency: "USD";
  tagline: string;
  description: string;
  longDescription: string;
  images: string[];
  variants: ProductVariant[];
  bestseller?: boolean;
  newArrival?: boolean;
  specs: ProductSpec[];
  reviews: Review[];
}

export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  image: string;
  priceCents: number;
  quantity: number;
  variantName: string;
}

export interface OrderItem extends Omit<CartItem, "productSlug" | "image"> {
  id: string;
}

export interface Order {
  id: string;
  status: "paid" | "processing";
  createdAt: string;
  totalCents: number;
  items: OrderItem[];
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  eyebrow: string;
  description: string;
  heroImage: string;
}