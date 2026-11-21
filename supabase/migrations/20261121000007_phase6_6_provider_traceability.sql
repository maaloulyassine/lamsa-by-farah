begin;

-- Phase 6.6: demo providers are being replaced by real ones.
-- Clean up orphaned references so the FK constraints don't block.
-- This is documented in DEVELOPMENT_LOG.md.
-- (favorites/contact_requests already cascade on provider delete; the explicit
-- deletes keep the intent visible.) On a fresh `db reset` the providers table is
-- still empty here (seed.sql runs after migrations), so these delete nothing.
delete from public.contact_requests
where provider_id in (select id from public.providers where is_demo = true);

delete from public.favorites
where provider_id in (select id from public.providers where is_demo = true);

delete from public.providers where is_demo = true;

-- Traceability of real provider data
alter table public.providers
  add column if not exists data_source text default 'manual_research',
  add column if not exists last_verified_at timestamptz;

comment on column public.providers.data_source is
  'Source of the provider data: manual_research | google_places | partner_import';
comment on column public.providers.last_verified_at is
  'Last time a human verified the phone/address';

commit;
