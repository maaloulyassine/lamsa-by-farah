-- Reversal for 20261121000007_phase6_6_provider_traceability.sql
-- Drops the traceability columns. The deleted demo providers (and the favorites /
-- contact requests that referenced them) are NOT restored: re-run the previous
-- seed.sql from git history if the demo catalogue is needed again.
begin;
alter table public.providers
  drop column if exists data_source,
  drop column if exists last_verified_at;
commit;
