-- Life Academy Phase 1 founder controls. Apply after the base Academy migration.
-- These RPCs run with a founder-role check and return only founder-authorized data.

create or replace function public.academy_founder_metrics()
returns table (
  learner_count bigint,
  completion_count bigint,
  capability_response_count bigint,
  published_lesson_count bigint
) language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.academy_profiles),
    (select count(*) from public.academy_completions),
    (select count(*) from public.academy_capability_responses),
    (select count(*) from public.academy_lessons where status = 'published')
  where public.is_academy_founder();
$$;

create or replace function public.academy_founder_recent_learners()
returns table (
  user_id uuid,
  display_name text,
  joined_at timestamptz,
  completion_count bigint
) language sql stable security definer set search_path = public as $$
  select
    p.id,
    p.display_name,
    p.created_at,
    count(c.id) as completion_count
  from public.academy_profiles p
  left join public.academy_completions c on c.user_id = p.id
  where public.is_academy_founder()
  group by p.id, p.display_name, p.created_at
  order by p.created_at desc
  limit 20;
$$;

revoke all on function public.academy_founder_metrics() from public;
grant execute on function public.academy_founder_metrics() to authenticated;
revoke all on function public.academy_founder_recent_learners() from public;
grant execute on function public.academy_founder_recent_learners() to authenticated;
