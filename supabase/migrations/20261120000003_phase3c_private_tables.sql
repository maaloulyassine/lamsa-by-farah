begin;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null
    references public.weddings(id) on delete cascade,
  title text not null,
  description text,
  task_date date not null,
  task_time time,
  status text not null default 'todo',
  notes text,
  estimated_cost numeric(12, 2),
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_status_check
    check (status in ('todo', 'in_progress', 'done')),
  constraint tasks_estimated_cost_check
    check (estimated_cost is null or estimated_cost >= 0)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null
    references public.weddings(id) on delete cascade,
  title text not null,
  category_id uuid not null
    references public.categories(id) on delete restrict,
  amount numeric(12, 2) not null,
  expense_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_amount_check check (amount > 0)
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,
  provider_id uuid not null
    references public.providers(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_provider_key unique (user_id, provider_id)
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,
  provider_id uuid not null
    references public.providers(id) on delete cascade,
  wedding_date date,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_requests_status_check
    check (status in ('pending', 'sent', 'closed'))
);

create index tasks_wedding_id_task_date_idx
  on public.tasks(wedding_id, task_date);

create index tasks_created_by_idx
  on public.tasks(created_by);

create index expenses_wedding_id_expense_date_idx
  on public.expenses(wedding_id, expense_date);

create index favorites_user_id_idx
  on public.favorites(user_id);

create index contact_requests_user_id_idx
  on public.contact_requests(user_id);

create index contact_requests_provider_id_idx
  on public.contact_requests(provider_id);

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

create trigger contact_requests_set_updated_at
before update on public.contact_requests
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.expenses enable row level security;
alter table public.favorites enable row level security;
alter table public.contact_requests enable row level security;

create policy tasks_select_owner
on public.tasks for select to authenticated
using (
  exists (
    select 1 from public.weddings
    where weddings.id = tasks.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy tasks_insert_owner
on public.tasks for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.weddings
    where weddings.id = tasks.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy tasks_update_owner
on public.tasks for update to authenticated
using (
  exists (
    select 1 from public.weddings
    where weddings.id = tasks.wedding_id
      and weddings.user_id = auth.uid()
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.weddings
    where weddings.id = tasks.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy tasks_delete_owner
on public.tasks for delete to authenticated
using (
  exists (
    select 1 from public.weddings
    where weddings.id = tasks.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy expenses_select_owner
on public.expenses for select to authenticated
using (
  exists (
    select 1 from public.weddings
    where weddings.id = expenses.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy expenses_insert_owner
on public.expenses for insert to authenticated
with check (
  exists (
    select 1 from public.weddings
    where weddings.id = expenses.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy expenses_update_owner
on public.expenses for update to authenticated
using (
  exists (
    select 1 from public.weddings
    where weddings.id = expenses.wedding_id
      and weddings.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.weddings
    where weddings.id = expenses.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy expenses_delete_owner
on public.expenses for delete to authenticated
using (
  exists (
    select 1 from public.weddings
    where weddings.id = expenses.wedding_id
      and weddings.user_id = auth.uid()
  )
);

create policy favorites_select_own
on public.favorites for select to authenticated
using (auth.uid() = user_id);

create policy favorites_insert_own
on public.favorites for insert to authenticated
with check (auth.uid() = user_id);

create policy favorites_update_own
on public.favorites for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy favorites_delete_own
on public.favorites for delete to authenticated
using (auth.uid() = user_id);

create policy contact_requests_select_owner
on public.contact_requests for select to authenticated
using (auth.uid() = user_id);

create policy contact_requests_insert_owner
on public.contact_requests for insert to authenticated
with check (
  auth.uid() = user_id
  and status = 'pending'
);

create policy contact_requests_update_owner
on public.contact_requests for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and status = 'pending'
);

-- ADMIN POLICY NOTE: dead code until an admin UI/JWT provisioning flow exists.
create policy contact_requests_update_admin
on public.contact_requests for update to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

commit;
