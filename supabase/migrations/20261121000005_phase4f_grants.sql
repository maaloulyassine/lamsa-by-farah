-- Phase 4f: explicit GRANTs for cloud Supabase
-- Local Supabase auto-grants via default privileges, cloud does not.
-- RLS policies remain the row-level security boundary.

-- Schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Authenticated: full DML on all public tables
-- RLS policies restrict which rows each user can access.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Anonymous: read-only catalog
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.governorates TO anon;
GRANT SELECT ON public.providers TO anon;

-- Sequences (defensive, for any future serial columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- RPC for planner (SECURITY INVOKER needs EXECUTE)
GRANT EXECUTE ON FUNCTION public.set_wedding_plan(uuid) TO authenticated;
