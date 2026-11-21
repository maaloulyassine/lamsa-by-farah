begin;

alter table public.tasks
  add column template_key text;

alter table public.tasks
  add column is_generated boolean
  generated always as (template_key is not null) stored;

create unique index tasks_wedding_template_key_unique
  on public.tasks(wedding_id, template_key)
  where template_key is not null;

create index tasks_wedding_date_status_idx
  on public.tasks(wedding_id, task_date, status);

create or replace function public.set_wedding_plan(p_wedding_id uuid)
returns setof public.tasks
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_wedding public.weddings%rowtype;
  v_today date;
begin
  select *
  into v_wedding
  from public.weddings
  where id = p_wedding_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Wedding not found or access denied';
  end if;

  v_today := (now() at time zone 'Africa/Tunis')::date;

  delete from public.tasks
  where wedding_id = p_wedding_id
    and template_key is not null;

  insert into public.tasks (
    wedding_id,
    template_key,
    title,
    description,
    task_date,
    status,
    estimated_cost,
    created_by
  )
  select
    p_wedding_id,
    t.template_key,
    t.title,
    t.description,
    case
      when v_wedding.wedding_date >= v_today
        and v_wedding.wedding_date - v_today < 30
      then least(greatest(
        v_wedding.wedding_date - t.days_offset,
        coalesce(v_wedding.preparation_start_date, v_today),
        v_today
      ), v_wedding.wedding_date)
      else least(greatest(
        v_wedding.wedding_date - t.days_offset,
        coalesce(
          v_wedding.preparation_start_date,
          v_wedding.wedding_date - t.days_offset
        )
      ), v_wedding.wedding_date)
    end,
    'todo',
    t.estimated_cost,
    auth.uid()
  from (values
    ('define_budget', 'Définir le budget',
     'Fixer les postes principaux et définir le budget disponible.', 365, 0),
    ('guest_list', 'Établir la liste des invités',
     'Recenser les invités et préparer les versions provisoire et finale.', 300, 0),
    ('venue', 'Rechercher, visiter et réserver la salle',
     'Comparer les salles, visiter les options et confirmer la réservation.', 180, 5000),
    ('wedding_attire', 'Choisir la robe et les tenues',
     'Sélectionner les tenues du couple et des proches.', 150, 3500),
    ('caterer', 'Choisir le traiteur',
     'Comparer les menus, définir le nombre d’invités et confirmer.', 150, 4000),
    ('photographer', 'Choisir le photographe',
     'Comparer les portfolios, disponibilités et packs.', 150, 2500),
    ('beauty', 'Réserver coiffure et maquillage',
     'Organiser les essais et réserver les prestations.', 120, 800),
    ('flowers_decoration', 'Planifier décoration et fleurs',
     'Définir le thème, les fleurs et la décoration de la salle.', 120, 2500),
    ('cake', 'Choisir le wedding cake',
     'Sélectionner le goût, le design et confirmer la livraison.', 100, 900),
    ('dj_artists', 'Réserver DJ et artistes',
     'Définir la playlist, les animations et les horaires.', 90, 1500),
    ('invitations', 'Préparer les invitations',
     'Finaliser le contenu, imprimer et préparer l’envoi.', 60, 600),
    ('confirm_providers', 'Confirmer tous les prestataires',
     'Vérifier les horaires, adresses, acomptes et coordonnées.', 14, 0),
    ('final_checks', 'Faire les dernières vérifications',
     'Vérifier le programme, les tenues, les documents et les aides.', 7, 0),
    ('shooting', 'Planifier le shooting des mariés',
     'Fixer l’heure, le lieu, la tenue et les notes du shooting.', 2, 500),
    ('wedding_day', 'Jour du mariage',
     'Célébrer le jour J selon le programme final.', 0, 0)
  ) as t(template_key, title, description, days_offset, estimated_cost);

  return query
  select *
  from public.tasks
  where wedding_id = p_wedding_id
  order by task_date, task_time nulls last;
end;
$$;

commit;
