-- ASTRA Horlogerie — schema v1
-- Applied via `supabase db push` against a local or hosted project.

create extension if not exists "uuid-ossp";

create table if not exists public.collections (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  eyebrow text,
  description text,
  hero_image text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  subtitle text,
  collection_id uuid references public.collections(id) on delete set null,
  price_cents integer not null,
  compare_at_price_cents integer,
  currency text not null default 'USD',
  tagline text,
  description text,
  long_description text,
  images jsonb not null default '[]',
  specs jsonb not null default '[]',
  bestseller boolean not null default false,
  new_arrival boolean not null default false,
  published boolean not null default true,
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_cents integer not null,
  stock integer not null default 0
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  author text not null,
  rating smallint not null check (rating between 1 and 5),
  date text,
  title text,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  postal_code text,
  country text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity smallint not null default 1 check (quantity between 1 and 9),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, variant_id)
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique,
  customer_email text,
  status text not null default 'paid',
  total_cents integer not null,
  currency text not null default 'usd',
  items jsonb not null default '[]',
  shipping jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_collection_idx on public.products(collection_id);
create index if not exists orders_user_idx on public.orders(user_id);

-- RLS: catalog is public-read; everything customer-owned is owner-only.
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;

drop policy if exists "catalog public read" on public.collections;
drop policy if exists "products public read" on public.products;
drop policy if exists "variants public read" on public.product_variants;
drop policy if exists "reviews public read" on public.reviews;
drop policy if exists "own addresses" on public.addresses;
drop policy if exists "own cart" on public.cart_items;
drop policy if exists "own orders read" on public.orders;

create policy "catalog public read" on public.collections for select using (true);
create policy "products public read" on public.products for select using (published = true);
create policy "variants public read" on public.product_variants for select using (true);
create policy "reviews public read" on public.reviews for select using (true);

create policy "own addresses" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own cart" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own orders read" on public.orders
  for select using (auth.uid() = user_id or customer_email = auth.jwt() ->> 'email');

-- Service-role writes to orders go through the Stripe webhook (bypasses RLS).
