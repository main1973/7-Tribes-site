-- 7Tribes Account foundation. Apply after the role-enum migration.
-- Browser input and URL parameters never grant roles.

alter table public.academy_profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists terms_version text;

create or replace function public.handle_new_academy_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.academy_profiles (
    id, display_name, terms_accepted_at, privacy_accepted_at, terms_version
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    case when (new.raw_user_meta_data ->> 'terms_accepted') = 'true' then now() else null end,
    case when (new.raw_user_meta_data ->> 'privacy_accepted') = 'true' then now() else null end,
    nullif(new.raw_user_meta_data ->> 'terms_version', '')
  ) on conflict (id) do nothing;

  insert into public.academy_user_roles (user_id, role)
  values (new.id, 'member')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function public.is_academy_founder()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.academy_user_roles
    where user_id = auth.uid() and role in ('admin', 'founder_admin')
  );
$$;

create or replace function public.get_7tribes_account_overview()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'display_name', (select display_name from public.academy_profiles where id = auth.uid()),
    'role', (select role::text from public.academy_user_roles where user_id = auth.uid()),
    'completed_lessons', (select count(*) from public.academy_completions where user_id = auth.uid()),
    'capability_profile_ready', exists(select 1 from public.academy_capability_profiles where user_id = auth.uid())
  ) where auth.uid() is not null;
$$;

revoke all on function public.get_7tribes_account_overview() from public;
grant execute on function public.get_7tribes_account_overview() to authenticated;
