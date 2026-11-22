-- Reversal of 20261122000008_phase5c_grants_cleanup.sql (manual use only).
-- Restores the cloud project's pre-5c privileges, recorded read-only on 2026-11-22:
--   anon / authenticated had TRUNCATE on every public table;
--   service_role had only REFERENCES, TRIGGER, TRUNCATE on public tables (no CRUD);
--   service_role already had EXECUTE on public.set_wedding_plan(uuid) before 5c, so that grant is NOT revoked here;
--   public has no sequences, so the sequence statement is a no-op kept for symmetry.
-- Note: the local Supabase stack starts with full default grants for service_role; running this file
-- locally would remove those defaults (a fresh `supabase db reset` without the 5c migration restores them).
begin;
GRANT TRUNCATE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM service_role;
REVOKE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public FROM service_role;
commit;
