begin;

create extension if not exists pgcrypto;

create table public.governorates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.governorates (name, slug) values
  ('Ariana', 'ariana'),
  ('Béja', 'beja'),
  ('Ben Arous', 'ben-arous'),
  ('Bizerte', 'bizerte'),
  ('Gabès', 'gabes'),
  ('Gafsa', 'gafsa'),
  ('Jendouba', 'jendouba'),
  ('Kairouan', 'kairouan'),
  ('Kasserine', 'kasserine'),
  ('Kébili', 'kebili'),
  ('Le Kef', 'le-kef'),
  ('Mahdia', 'mahdia'),
  ('La Manouba', 'la-manouba'),
  ('Médenine', 'medenine'),
  ('Monastir', 'monastir'),
  ('Nabeul', 'nabeul'),
  ('Sfax', 'sfax'),
  ('Sidi Bouzid', 'sidi-bouzid'),
  ('Siliana', 'siliana'),
  ('Sousse', 'sousse'),
  ('Tataouine', 'tataouine'),
  ('Tozeur', 'tozeur'),
  ('Tunis', 'tunis'),
  ('Zaghouan', 'zaghouan')
on conflict (slug) do update
set name = excluded.name, is_active = true;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  couple_name text not null,
  wedding_date date not null,
  preparation_start_date date,
  governorate_id uuid not null references public.governorates(id) on delete restrict,
  city text not null,
  guest_count integer,
  total_budget numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weddings_guest_count_check check (guest_count is null or guest_count >= 0),
  constraint weddings_total_budget_check check (total_budget >= 0),
  constraint weddings_preparation_date_check
    check (preparation_start_date is null or preparation_start_date <= wedding_date)
);

create index weddings_user_id_idx on public.weddings(user_id);
create index weddings_governorate_id_idx on public.weddings(governorate_id);
create index governorates_is_active_idx on public.governorates(is_active) where is_active = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger weddings_set_updated_at
before update on public.weddings
for each row execute function public.set_updated_at();

create trigger governorates_set_updated_at
before update on public.governorates
for each row execute function public.set_updated_at();

-- SECURITY DEFINER: auth user signup needs elevated insert access to profiles.
-- Do not enable FORCE ROW LEVEL SECURITY on profiles; it can break this trigger.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      phone = excluded.phone;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- UNIQUE(user_id) is the real MVP enforcement. This trigger is defense-in-depth.
create or replace function public.prevent_second_wedding()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if exists (select 1 from public.weddings where user_id = new.user_id) then
      raise exception 'An MVP user may own only one wedding project';
    end if;
  elsif tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'A wedding project cannot be transferred';
  end if;
  return new;
end;
$$;

create trigger weddings_single_project_check
before insert or update on public.weddings
for each row execute function public.prevent_second_wedding();

alter table public.governorates enable row level security;
alter table public.profiles enable row level security;
alter table public.weddings enable row level security;

create policy governorates_select_public_active
on public.governorates
for select
to anon, authenticated
using (is_active = true);

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy profiles_delete_own
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

create policy weddings_select_owner
on public.weddings
for select
to authenticated
using (auth.uid() = user_id);

create policy weddings_insert_owner
on public.weddings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy weddings_update_owner
on public.weddings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy weddings_delete_owner
on public.weddings
for delete
to authenticated
using (auth.uid() = user_id);

commit;
