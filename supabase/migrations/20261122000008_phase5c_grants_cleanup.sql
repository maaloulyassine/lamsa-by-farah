-- Phase 5c: grants cleanup.
-- * anon / authenticated must never be able to TRUNCATE (TRUNCATE bypasses RLS).
-- * service_role (server-side / dashboard tooling) gets back the CRUD grants the cloud project was missing.
-- RLS policies are unchanged; service_role bypasses RLS by design and its key is never shipped to the client.
begin;
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION public.set_wedding_plan(uuid) TO service_role;
commit;
