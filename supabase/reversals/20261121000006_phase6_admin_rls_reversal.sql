-- Reversal for 20261121000006_phase6_admin_rls.sql
-- Removes only what Phase 6 added; Phase 3c policies (incl. contact_requests_update_admin) stay.
begin;

drop trigger if exists contact_requests_admin_column_guard on public.contact_requests;
drop function if exists public.contact_requests_admin_column_guard();

drop policy if exists contact_requests_select_admin on public.contact_requests;
drop policy if exists profiles_select_admin on public.profiles;

commit;
