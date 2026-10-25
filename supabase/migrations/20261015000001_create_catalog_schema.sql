create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default '[STORE NAME]',
  whatsapp_number text not null,
  phone text,
  address text,
  opening_hours text,
  logo_url text,
  low_stock_threshold integer not null default 3,
  updated_at timestamptz default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  slug text unique not null,
  position integer not null default 0,
  created_at timestamptz default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 120),
  slug text unique not null,
  description text,
  price_ngn numeric(12, 2) not null check (price_ngn >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_published boolean not null default false,
  details jsonb not null default '{}'::jsonb,
  search_text tsvector generated always as (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index products_category_idx on public.products(category_id);
create index products_search_idx on public.products using gin(search_text);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  position integer not null default 0,
  created_at timestamptz default now()
);

create index product_images_product_idx
  on public.product_images(product_id, position);

alter table public.store_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
