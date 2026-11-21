begin;

-- Phase 6: minimal admin panel for contact requests
-- POST-MVP bonus, not part of spec §12.
-- Admin is identified by app_metadata.is_admin === true in the JWT
-- (app_metadata is only writable server-side: Dashboard / service role / SQL).

-- Admin can SELECT all contact_requests (no change to update policy,
-- which was created in Phase 3c as contact_requests_update_admin)
create policy contact_requests_select_admin
on public.contact_requests
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Admin can SELECT all profiles (to see client full_name + phone)
create policy profiles_select_admin
on public.profiles
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Column guard: contact_requests_update_admin (Phase 3c) only checks is_admin,
-- and RLS cannot restrict columns. Non-owners (admins) may change status only.
create or replace function public.contact_requests_admin_column_guard()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- Admins (auth.uid() != owner) may ONLY change the status column.
  -- Owners can do whatever their RLS policy allows (status must stay
  -- 'pending' per contact_requests_update_owner's WITH CHECK).
  -- updated_at is intentionally NOT checked — it's auto-set by the
  -- existing contact_requests_set_updated_at trigger, and PostgreSQL
  -- fires BEFORE UPDATE triggers in alphabetical order:
  --   contact_requests_admin_column_guard  ← fires first
  --   contact_requests_set_updated_at      ← fires second
  -- So at guard time, new.updated_at still equals old.updated_at.
  if auth.uid() is distinct from old.user_id then
    if new.message is distinct from old.message
       or new.wedding_date is distinct from old.wedding_date
       or new.user_id is distinct from old.user_id
       or new.provider_id is distinct from old.provider_id
       or new.created_at is distinct from old.created_at then
      raise exception 'Admins may only update the status column of contact requests';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists contact_requests_admin_column_guard on public.contact_requests;
create trigger contact_requests_admin_column_guard
before update on public.contact_requests
for each row execute function public.contact_requests_admin_column_guard();

commit;
