-- 7Tribes Life Academy — Phase 1 secure data foundation
-- Apply in the Supabase SQL Editor for project dhawwokxkeurcmiemxbm.
-- This migration creates private learner records, founder-only administration,
-- RLS policies, and server-side completion logic. It does not seed fake activity.

create extension if not exists pgcrypto;

do $$ begin
  create type public.academy_role as enum ('learner', 'founder_admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.academy_content_status as enum ('draft', 'published', 'coming_soon');
exception when duplicate_object then null;
end $$;

create table if not exists public.academy_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.academy_role not null default 'learner',
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id)
);

create table if not exists public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  status public.academy_content_status not null default 'draft',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  status public.academy_content_status not null default 'draft',
  position integer not null default 0,
  unique(course_id, slug),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  estimated_minutes integer check (estimated_minutes between 1 and 240),
  status public.academy_content_status not null default 'draft',
  position integer not null default 0,
  lesson_content jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, slug)
);

-- Quiz answer keys are never publicly selectable. A limited RPC returns prompts only.
create table if not exists public.academy_lesson_quizzes (
  lesson_id uuid primary key references public.academy_lessons(id) on delete cascade,
  questions jsonb not null default '[]'::jsonb,
  answer_key jsonb not null default '{}'::jsonb,
  passing_score integer not null default 0 check (passing_score >= 0),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  current_section text,
  completed_sections jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create table if not exists public.academy_scenario_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  scenario_key text not null,
  selected_option text not null,
  submitted_at timestamptz not null default now(),
  unique(user_id, lesson_id, scenario_key)
);

create table if not exists public.academy_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  submitted_answers jsonb not null default '{}'::jsonb,
  score integer not null default 0 check (score >= 0),
  passed boolean not null default false,
  submitted_at timestamptz not null default now()
);

create table if not exists public.academy_capability_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  community_strengths text[] not null default '{}',
  interests text[] not null default '{}',
  collaboration_preferences text,
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_capability_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  response jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.academy_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.academy_admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_academy_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_academy_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.academy_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'))
  on conflict (id) do nothing;
  insert into public.academy_user_roles (user_id, role)
  values (new.id, 'learner')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_academy on auth.users;
create trigger on_auth_user_created_academy
  after insert on auth.users
  for each row execute procedure public.handle_new_academy_user();

create or replace function public.is_academy_founder()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.academy_user_roles
    where user_id = auth.uid() and role = 'founder_admin'
  );
$$;

create or replace function public.set_academy_user_role(p_user_id uuid, p_role public.academy_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_academy_founder() then
    raise exception 'Founder access required';
  end if;

  insert into public.academy_user_roles (user_id, role, assigned_by)
  values (p_user_id, p_role, auth.uid())
  on conflict (user_id) do update
    set role = excluded.role,
        assigned_at = now(),
        assigned_by = auth.uid();

  insert into public.academy_admin_audit_log (admin_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'set_role', 'academy_user_roles', p_user_id, jsonb_build_object('role', p_role));
end;
$$;

create or replace function public.get_academy_lesson_quiz(p_lesson_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(q.questions, '[]'::jsonb)
  from public.academy_lesson_quizzes q
  join public.academy_lessons l on l.id = q.lesson_id
  where q.lesson_id = p_lesson_id
    and (l.status = 'published' or public.is_academy_founder());
$$;

create or replace function public.submit_academy_quiz(p_lesson_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_questions jsonb;
  v_answer_key jsonb;
  v_passing_score integer;
  v_score integer := 0;
  v_question jsonb;
  v_passed boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select questions, answer_key, passing_score
    into v_questions, v_answer_key, v_passing_score
  from public.academy_lesson_quizzes
  where lesson_id = p_lesson_id;

  if v_questions is null then
    raise exception 'Quiz not configured';
  end if;

  for v_question in select value from jsonb_array_elements(v_questions)
  loop
    if p_answers ->> (v_question ->> 'id') = v_answer_key ->> (v_question ->> 'id') then
      v_score := v_score + 1;
    end if;
  end loop;

  v_passed := v_score >= v_passing_score;

  insert into public.academy_quiz_attempts (user_id, lesson_id, submitted_answers, score, passed)
  values (auth.uid(), p_lesson_id, coalesce(p_answers, '{}'::jsonb), v_score, v_passed);

  return jsonb_build_object('score', v_score, 'passed', v_passed);
end;
$$;

create or replace function public.complete_academy_lesson(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_passed boolean;
  v_capability_submitted boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select exists (
    select 1 from public.academy_quiz_attempts
    where user_id = auth.uid() and lesson_id = p_lesson_id and passed = true
  ) into v_passed;

  select exists (
    select 1 from public.academy_capability_responses
    where user_id = auth.uid() and lesson_id = p_lesson_id
  ) into v_capability_submitted;

  if not v_passed or not v_capability_submitted then
    raise exception 'Complete a passing quiz and capability exercise first';
  end if;

  insert into public.academy_completions (user_id, lesson_id)
  values (auth.uid(), p_lesson_id)
  on conflict (user_id, lesson_id) do nothing;

  insert into public.academy_lesson_progress (user_id, lesson_id, completed_at, last_seen_at)
  values (auth.uid(), p_lesson_id, now(), now())
  on conflict (user_id, lesson_id) do update
    set completed_at = coalesce(public.academy_lesson_progress.completed_at, excluded.completed_at),
        last_seen_at = excluded.last_seen_at;

  return jsonb_build_object('completed', true);
end;
$$;

-- Lock all learner and founder data behind Row Level Security.
alter table public.academy_profiles enable row level security;
alter table public.academy_user_roles enable row level security;
alter table public.academy_courses enable row level security;
alter table public.academy_modules enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_lesson_quizzes enable row level security;
alter table public.academy_lesson_progress enable row level security;
alter table public.academy_scenario_responses enable row level security;
alter table public.academy_quiz_attempts enable row level security;
alter table public.academy_capability_profiles enable row level security;
alter table public.academy_capability_responses enable row level security;
alter table public.academy_completions enable row level security;
alter table public.academy_admin_audit_log enable row level security;

create policy "academy profiles are private" on public.academy_profiles
  for select using (auth.uid() = id or public.is_academy_founder());
create policy "learners update only own profile" on public.academy_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "roles visible to owner or founder" on public.academy_user_roles
  for select using (auth.uid() = user_id or public.is_academy_founder());

create policy "published courses are public" on public.academy_courses
  for select using (status = 'published' or public.is_academy_founder());
create policy "founders manage courses" on public.academy_courses
  for all using (public.is_academy_founder()) with check (public.is_academy_founder());

create policy "published modules are public" on public.academy_modules
  for select using (status = 'published' or public.is_academy_founder());
create policy "founders manage modules" on public.academy_modules
  for all using (public.is_academy_founder()) with check (public.is_academy_founder());

create policy "published lessons are public" on public.academy_lessons
  for select using (status = 'published' or public.is_academy_founder());
create policy "founders manage lessons" on public.academy_lessons
  for all using (public.is_academy_founder()) with check (public.is_academy_founder());

create policy "founders manage private quiz keys" on public.academy_lesson_quizzes
  for all using (public.is_academy_founder()) with check (public.is_academy_founder());

create policy "own or founder progress" on public.academy_lesson_progress
  for select using (auth.uid() = user_id or public.is_academy_founder());
create policy "learners insert own progress" on public.academy_lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "learners update own progress" on public.academy_lesson_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own or founder scenarios" on public.academy_scenario_responses
  for select using (auth.uid() = user_id or public.is_academy_founder());
create policy "learners insert own scenarios" on public.academy_scenario_responses
  for insert with check (auth.uid() = user_id);
create policy "learners update own scenarios" on public.academy_scenario_responses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own or founder quiz attempts" on public.academy_quiz_attempts
  for select using (auth.uid() = user_id or public.is_academy_founder());

create policy "own or founder capability profile" on public.academy_capability_profiles
  for select using (auth.uid() = user_id or public.is_academy_founder());
create policy "learners insert own capability profile" on public.academy_capability_profiles
  for insert with check (auth.uid() = user_id);
create policy "learners update own capability profile" on public.academy_capability_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own or founder capability responses" on public.academy_capability_responses
  for select using (auth.uid() = user_id or public.is_academy_founder());
create policy "learners insert own capability responses" on public.academy_capability_responses
  for insert with check (auth.uid() = user_id);
create policy "learners update own capability responses" on public.academy_capability_responses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own or founder completions" on public.academy_completions
  for select using (auth.uid() = user_id or public.is_academy_founder());

create policy "founders read audit log" on public.academy_admin_audit_log
  for select using (public.is_academy_founder());

revoke all on function public.is_academy_founder() from public;
grant execute on function public.is_academy_founder() to anon, authenticated;
revoke all on function public.set_academy_user_role(uuid, public.academy_role) from public;
grant execute on function public.set_academy_user_role(uuid, public.academy_role) to authenticated;
revoke all on function public.get_academy_lesson_quiz(uuid) from public;
grant execute on function public.get_academy_lesson_quiz(uuid) to anon, authenticated;
revoke all on function public.submit_academy_quiz(uuid, jsonb) from public;
grant execute on function public.submit_academy_quiz(uuid, jsonb) to authenticated;
revoke all on function public.complete_academy_lesson(uuid) from public;
grant execute on function public.complete_academy_lesson(uuid) to authenticated;

-- Bootstrap the founder only after the intended founder has created an auth account.
-- Replace the placeholder UUID in the SQL Editor; never expose a founder role in browser code.
-- update public.academy_user_roles
-- set role = 'founder_admin', assigned_by = '<founder-user-id>'::uuid
-- where user_id = '<founder-user-id>'::uuid;
