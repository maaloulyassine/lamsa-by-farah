begin;

drop function if exists public.set_wedding_plan(uuid);

drop index if exists public.tasks_wedding_template_key_unique;
drop index if exists public.tasks_wedding_date_status_idx;

alter table public.tasks
  drop column if exists is_generated;

alter table public.tasks
  drop column if exists template_key;

commit;
