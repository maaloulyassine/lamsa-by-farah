begin;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_sort_order_check check (sort_order >= 0)
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  governorate_id uuid not null references public.governorates(id) on delete restrict,
  city text not null,
  address text,
  description text,
  price_from numeric(12, 2),
  price_to numeric(12, 2),
  price_unit text not null default 'TND',
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  cover_image_url text,
  gallery jsonb not null default '[]'::jsonb,
  phone text,
  website text,
  social_url text,
  availability_notes text,
  is_demo boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint providers_rating_check check (rating >= 0 and rating <= 5),
  constraint providers_review_count_check check (review_count >= 0),
  constraint providers_price_from_check check (price_from is null or price_from >= 0),
  constraint providers_price_to_check check (price_to is null or price_to >= 0),
  constraint providers_price_range_check
    check (price_to is null or price_from is null or price_to >= price_from)
);

create index providers_category_governorate_idx
  on public.providers(category_id, governorate_id);

create index providers_governorate_id_idx
  on public.providers(governorate_id);

create index providers_is_active_idx
  on public.providers(is_active)
  where is_active = true;

create index categories_is_active_idx
  on public.categories(is_active)
  where is_active = true;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger providers_set_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.providers enable row level security;

create policy categories_select_public_active
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy providers_select_public_active
on public.providers
for select
to anon, authenticated
using (is_active = true);

commit;
