-- 7Tribes Life Academy — Lesson 7: How Communities Build / Module 1 capstone
-- Idempotent curriculum extension. It never creates learner, progress, response, quiz-attempt, completion, profile, or role data.

begin;

create table if not exists public.academy_module_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.academy_module_completions enable row level security;

drop policy if exists "academy_module_completions_owner_select" on public.academy_module_completions;
create policy "academy_module_completions_owner_select"
  on public.academy_module_completions for select to authenticated
  using (user_id = auth.uid() or public.is_academy_founder());

revoke all on table public.academy_module_completions from anon;
revoke all on table public.academy_module_completions from authenticated;
grant select on table public.academy_module_completions to authenticated;

create or replace function public.complete_academy_lesson7(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sections jsonb;
  v_required_sections jsonb := '["communities-systems","complaints-problems","authority","capability-before-capital","capability-map","gap-detection","businesses-infrastructure","ownership-result","sustainability","project-economics","coordination","ecosystem","build-plan","contribution","knowledge-check"]'::jsonb;
  v_quiz_passed boolean;
  v_plan_complete boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.academy_lessons where id = p_lesson_id and slug = 'how-communities-build' and status = 'published') then
    raise exception 'Published Lesson 7 not found';
  end if;
  select completed_sections into v_sections from public.academy_lesson_progress where user_id = auth.uid() and lesson_id = p_lesson_id;
  if coalesce(v_sections, '[]'::jsonb) @> v_required_sections is false then raise exception 'Read each Lesson 7 section before completion'; end if;
  select exists (select 1 from public.academy_quiz_attempts where user_id = auth.uid() and lesson_id = p_lesson_id and passed = true) into v_quiz_passed;
  if not v_quiz_passed then raise exception 'Pass the Lesson 7 Knowledge Check before completion'; end if;
  select exists (
    select 1 from public.academy_lesson_exercise_responses
    where user_id = auth.uid() and lesson_id = p_lesson_id and exercise_key = 'community-build-plan'
      and response ?& array['need','problem','existing_capabilities','gaps','sustainability','contribution']
      and coalesce(response->>'need','') <> '' and coalesce(response->>'problem','') <> ''
      and coalesce(response->>'existing_capabilities','') <> '' and coalesce(response->>'gaps','') <> ''
      and coalesce(response->>'sustainability','') <> '' and coalesce(response->>'contribution','') <> ''
  ) into v_plan_complete;
  if not v_plan_complete then raise exception 'Complete your private Community Build Plan and contribution before finishing Lesson 7'; end if;
  insert into public.academy_completions (user_id, lesson_id) values (auth.uid(), p_lesson_id) on conflict (user_id, lesson_id) do nothing;
  insert into public.academy_lesson_progress (user_id, lesson_id, completed_at, last_seen_at) values (auth.uid(), p_lesson_id, now(), now())
  on conflict (user_id, lesson_id) do update set completed_at = coalesce(public.academy_lesson_progress.completed_at, excluded.completed_at), last_seen_at = excluded.last_seen_at;
  return jsonb_build_object('completed', true);
end;
$$;

create or replace function public.complete_academy_module_one(p_module_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_completion_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.academy_modules where id = p_module_id and slug = 'how-america-works') then raise exception 'Module 1 not found'; end if;
  select count(*) into v_completion_count
  from public.academy_lessons l join public.academy_completions c on c.lesson_id = l.id and c.user_id = auth.uid()
  where l.module_id = p_module_id and l.position between 1 and 7 and l.status = 'published';
  if v_completion_count <> 7 then raise exception 'Complete all seven Module 1 lessons before recording module completion'; end if;
  insert into public.academy_module_completions (user_id, module_id) values (auth.uid(), p_module_id) on conflict (user_id, module_id) do nothing;
  return jsonb_build_object('completed', true, 'lessons_completed', v_completion_count);
end;
$$;

create or replace function public.get_academy_module_one_summary()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_module_id uuid; v_completed integer; v_quizzes integer; v_exercises integer; v_module_complete boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select id into v_module_id from public.academy_modules where slug = 'how-america-works' limit 1;
  select count(*) into v_completed from public.academy_completions c join public.academy_lessons l on l.id = c.lesson_id where c.user_id = auth.uid() and l.module_id = v_module_id and l.position between 1 and 7;
  select count(*) into v_quizzes from public.academy_quiz_attempts q join public.academy_lessons l on l.id = q.lesson_id where q.user_id = auth.uid() and q.passed and l.module_id = v_module_id and l.position between 1 and 7;
  select count(*) into v_exercises from public.academy_lesson_exercise_responses e join public.academy_lessons l on l.id = e.lesson_id where e.user_id = auth.uid() and l.module_id = v_module_id and l.position between 1 and 7;
  select exists(select 1 from public.academy_module_completions where user_id = auth.uid() and module_id = v_module_id) into v_module_complete;
  return jsonb_build_object('lessons_completed',v_completed,'knowledge_checks_passed',v_quizzes,'capability_exercises_completed',v_exercises,'community_build_plan_completed',exists(select 1 from public.academy_lesson_exercise_responses e join public.academy_lessons l on l.id=e.lesson_id where e.user_id=auth.uid() and l.slug='how-communities-build' and e.exercise_key='community-build-plan'),'module_completed',v_module_complete);
end;
$$;

revoke all on function public.complete_academy_lesson7(uuid) from public;
revoke execute on function public.complete_academy_lesson7(uuid) from anon;
grant execute on function public.complete_academy_lesson7(uuid) to authenticated;
revoke all on function public.complete_academy_module_one(uuid) from public;
revoke execute on function public.complete_academy_module_one(uuid) from anon;
grant execute on function public.complete_academy_module_one(uuid) to authenticated;
revoke all on function public.get_academy_module_one_summary() from public;
revoke execute on function public.get_academy_module_one_summary() from anon;
grant execute on function public.get_academy_module_one_summary() to authenticated;

do $$
declare v_module_id uuid; v_lesson_id uuid;
begin
  select id into v_module_id from public.academy_modules where slug = 'how-america-works' limit 1;
  if v_module_id is null then raise exception 'Approved Module 1 not found'; end if;
  insert into public.academy_lessons (module_id,slug,title,summary,estimated_minutes,status,position,lesson_content)
  values (v_module_id,'how-communities-build','How Communities Build','Learn how a community can define needs, map capabilities, identify gaps, organize projects, build sustainably, and preserve capability for the next generation.',38,'published',7,
  '{"version":1,"type":"lesson","sections":[{"key":"communities-systems","heading":"Communities are systems"},{"key":"complaints-problems","heading":"Complaints versus problems"},{"key":"authority","heading":"Who has authority?"},{"key":"capability-before-capital","heading":"Capability before capital"},{"key":"capability-map","heading":"Community Capability Map"},{"key":"gap-detection","heading":"Skills are not enough"},{"key":"businesses-infrastructure","heading":"Businesses as infrastructure"},{"key":"ownership-result","heading":"Ownership of the result"},{"key":"sustainability","heading":"Building it is only half the job"},{"key":"project-economics","heading":"Community Project Economics"},{"key":"coordination","heading":"Coordination"},{"key":"ecosystem","heading":"Connect the ecosystem"},{"key":"build-plan","heading":"The Community Build Plan"},{"key":"contribution","heading":"What could you contribute?"},{"key":"knowledge-check","heading":"Knowledge Check"}],"capability_categories":["Food/agriculture","Housing/construction","Transportation/logistics","Manufacturing","Technology","Healthcare","Education","Finance/accounting","Legal/professional services","Retail/commerce","Energy/utilities","Property/real estate","Media/communications","Arts/culture","Community organization","Project management"],"project_planner":{"disclaimer":"Educational Project Planner only. It is not financial, accounting, investment, legal, engineering, or development advice. It does not store results or create ecosystem statistics."},"module_completion":{"message":"You have completed the foundation of 7Tribes Life Academy. You learned how to identify authority, follow money, understand work, analyze businesses, examine ownership, understand wealth transfer, and turn community needs into capability plans.","badge_title":"7Tribes Life Academy — Module 1: How America Works — Completed","badge_notice":"Platform completion badge only. It is not an accredited credential, license, government certification, college credit, or professional certification."}}'::jsonb)
  on conflict (module_id,slug) do update set title=excluded.title,summary=excluded.summary,estimated_minutes=excluded.estimated_minutes,status=excluded.status,position=excluded.position,lesson_content=excluded.lesson_content returning id into v_lesson_id;
  insert into public.academy_lesson_quizzes (lesson_id,questions,answer_key,passing_score) values (v_lesson_id,
  '[
  {"id":"q1","prompt":"What turns a complaint into a useful problem statement?","choices":[{"id":"a","label":"Naming the conditions preventing a desired outcome."},{"id":"b","label":"Repeating dissatisfaction more loudly."},{"id":"c","label":"Assuming one person controls every factor."}],"explanations":{"a":"Correct. A useful statement identifies conditions to investigate.","b":"Dissatisfaction alone does not identify the work required.","c":"Community problems often involve multiple authorities and conditions."}},
  {"id":"q2","prompt":"What is the best first step before assuming a community project only needs money?","choices":[{"id":"a","label":"Map required capabilities and identify the real gaps."},{"id":"b","label":"Assume all skills are missing."},{"id":"c","label":"Promise a funding outcome."}],"explanations":{"a":"Correct. Capability mapping can distinguish existing capacity from critical gaps.","b":"The lesson avoids assuming a community has no capacity.","c":"The framework does not promise funding."}},
  {"id":"q3","prompt":"If electricians, carpenters, and plumbers are available but property control and financing are missing, what is the useful conclusion?","choices":[{"id":"a","label":"Construction capability exists; property control and financing are primary gaps."},{"id":"b","label":"More construction workers are the only need."},{"id":"c","label":"The project is guaranteed to succeed."}],"explanations":{"a":"Correct. Gap detection identifies the missing conditions.","b":"The listed trades are already available in the example.","c":"A map is investigation, not a guarantee."}},
  {"id":"q4","prompt":"Why can businesses be considered community infrastructure?","choices":[{"id":"a","label":"They can supply, buy from, contract with, and partner with other businesses and projects."},{"id":"b","label":"They only sell to individual consumers."},{"id":"c","label":"They remove the need for organization."}],"explanations":{"a":"Correct. Business relationships can support commercial infrastructure.","b":"Businesses can also serve other businesses and projects.","c":"Organization remains necessary."}},
  {"id":"q5","prompt":"What ownership question should be asked after a project succeeds?","choices":[{"id":"a","label":"Who controls the asset, receives benefits, carries liabilities, and maintains it?"},{"id":"b","label":"Which structure is always best?"},{"id":"c","label":"Whether ownership no longer matters."}],"explanations":{"a":"Correct. The lesson teaches questions, not one recommended structure.","b":"Lawful structures depend on circumstances and professional guidance.","c":"Ownership shapes control, benefits, liability, and continuity."}},
  {"id":"q6","prompt":"What makes a project sustainable?","choices":[{"id":"a","label":"Planning for operating revenue or funding, maintenance, management, governance, and measurement."},{"id":"b","label":"Opening it once and assuming it continues."},{"id":"c","label":"Ignoring replacement reserves."}],"explanations":{"a":"Correct. Sustainability requires ongoing systems.","b":"Building once is only half the job.","c":"Reserves can matter for continuity."}},
  {"id":"q7","prompt":"What does the coordination cycle begin with?","choices":[{"id":"a","label":"Learn and map before connecting, organizing, building, and measuring."},{"id":"b","label":"Publish a claim before investigation."},{"id":"c","label":"Guarantee an outcome."}],"explanations":{"a":"Correct. The cycle begins with understanding and mapping.","b":"The framework prioritizes investigation.","c":"It is not a guarantee of success."}},
  {"id":"q8","prompt":"What is a responsible measurement practice?","choices":[{"id":"a","label":"Use real, relevant outcomes such as people served or service availability when data exists."},{"id":"b","label":"Invent counts to make a project appear active."},{"id":"c","label":"Compare learners by intelligence."}],"explanations":{"a":"Correct. Measurement should reflect actual outcomes.","b":"The Academy never fabricates activity or outcomes.","c":"The Academy does not rank learners that way."}},
  {"id":"q9","prompt":"What does continuity planning ask?","choices":[{"id":"a","label":"What happens when organizers leave, what knowledge is documented, and who is trained next?"},{"id":"b","label":"Whether the original organizers can be ignored."},{"id":"c","label":"Whether maintenance is unnecessary."}],"explanations":{"a":"Correct. Continuity protects capability over time.","b":"A project needs continuity beyond its initial organizers.","c":"Maintenance is part of sustainability."}},
  {"id":"q10","prompt":"What is the privacy default for a Community Build Plan?","choices":[{"id":"a","label":"Private by default; it is not automatically posted to Loop or exposed through Connect."},{"id":"b","label":"Automatically published after saving."},{"id":"c","label":"Publicly aggregated into capability statistics."}],"explanations":{"a":"Correct. Future proposal publishing requires explicit learner confirmation and secure implementation.","b":"Saving does not publish a plan.","c":"Private capability information is not turned into identifiable statistics without permission."}}
  ]'::jsonb,
  '{"q1":"a","q2":"a","q3":"a","q4":"a","q5":"a","q6":"a","q7":"a","q8":"a","q9":"a","q10":"a"}'::jsonb,8)
  on conflict (lesson_id) do update set questions=excluded.questions,answer_key=excluded.answer_key,passing_score=excluded.passing_score;
end; $$;

commit;
