-- 7Tribes Life Academy — Lesson 3: How Work Actually Works
-- Idempotent curriculum extension. It never creates learner, progress, response, quiz-attempt, or completion data.

begin;

create or replace function public.complete_academy_lesson3(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sections jsonb;
  v_required_sections jsonb := '["basic-exchange","economic-positions","active-leverage","ownership-result","ownership-ladder","work-audit","capability-challenge","knowledge-check"]'::jsonb;
  v_quiz_passed boolean;
  v_capability_complete boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select completed_sections into v_sections
  from public.academy_lesson_progress
  where user_id = auth.uid() and lesson_id = p_lesson_id;

  if coalesce(v_sections, '[]'::jsonb) @> v_required_sections is false then
    raise exception 'Read each Lesson 3 section before completion';
  end if;

  select exists (
    select 1 from public.academy_quiz_attempts
    where user_id = auth.uid() and lesson_id = p_lesson_id and passed = true
  ) into v_quiz_passed;

  if not v_quiz_passed then
    raise exception 'Pass the Lesson 3 Knowledge Check before completion';
  end if;

  select exists (
    select 1 from public.academy_lesson_exercise_responses
    where user_id = auth.uid()
      and lesson_id = p_lesson_id
      and exercise_key = 'labor-to-capability'
      and response ?& array['skill','who_needs','direct_sale','repeatable_system','asset_tool','first_step']
      and coalesce(response->>'skill','') <> ''
      and coalesce(response->>'who_needs','') <> ''
      and coalesce(response->>'direct_sale','') <> ''
      and coalesce(response->>'repeatable_system','') <> ''
      and coalesce(response->>'asset_tool','') <> ''
      and coalesce(response->>'first_step','') <> ''
  ) into v_capability_complete;

  if not v_capability_complete then
    raise exception 'Complete the Labor to Capability challenge before finishing Lesson 3';
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

revoke all on function public.complete_academy_lesson3(uuid) from public;
grant execute on function public.complete_academy_lesson3(uuid) to authenticated;

do $$
declare
  v_module_id uuid;
  v_lesson_id uuid;
begin
  select id into v_module_id
  from public.academy_modules
  where slug = 'how-america-works'
  order by created_at asc
  limit 1;

  if v_module_id is null then
    raise exception 'Approved Module 1 (how-america-works) was not found';
  end if;

  insert into public.academy_lessons (
    module_id, slug, title, summary, estimated_minutes, status, position, lesson_content
  ) values (
    v_module_id,
    'how-work-actually-works',
    'How Work Actually Works',
    'Learn how time, skill, systems, ownership, risk, control, and leverage shape different ways of earning.',
    24,
    'published',
    3,
    '{
      "version": 1,
      "type": "lesson",
      "sections": [
        {"key":"basic-exchange","heading":"Work is an exchange"},
        {"key":"economic-positions","heading":"Four economic positions"},
        {"key":"active-leverage","heading":"Active and leveraged income"},
        {"key":"ownership-result","heading":"Who owns the result?"},
        {"key":"ownership-ladder","heading":"The ownership ladder"},
        {"key":"work-audit","heading":"Personal work audit"},
        {"key":"capability-challenge","heading":"From labor to capability"},
        {"key":"knowledge-check","heading":"Knowledge check"}
      ]
    }'::jsonb
  )
  on conflict (module_id, slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    estimated_minutes = excluded.estimated_minutes,
    status = excluded.status,
    position = excluded.position,
    lesson_content = excluded.lesson_content
  returning id into v_lesson_id;

  insert into public.academy_lesson_quizzes (lesson_id, questions, answer_key, passing_score)
  values (
    v_lesson_id,
    '[
      {"id":"q1","prompt":"What is the main economic difference between an employee and a business owner?","choices":[{"id":"a","label":"Employees work and owners do nothing."},{"id":"b","label":"Employees generally exchange labor under an employment arrangement, while owners control an ownership interest in a business system."},{"id":"c","label":"Employees cannot become wealthy."},{"id":"d","label":"Business owners always make more money."}],"explanations":{"a":"Both employees and owners can work. The distinction is not whether work exists.","b":"Correct. Employment and ownership involve different rights, risks, controls, and claims on a productive system.","c":"Employment does not determine a person’s future wealth or value.","d":"Ownership does not guarantee profit or higher income."}},
      {"id":"q2","prompt":"Does registering an LLC automatically create a functioning business system?","choices":[{"id":"a","label":"Yes."},{"id":"b","label":"No."}],"explanations":{"a":"A legal entity or name alone does not create customers, processes, delivery, or productive capacity.","b":"Correct. The economic question is what productive system can reliably serve customers or create value."}},
      {"id":"q3","prompt":"Which statement about self-employment is most accurate?","choices":[{"id":"a","label":"Self-employed people automatically earn passive income."},{"id":"b","label":"Self-employment can provide more control while still depending heavily on the owner’s personal labor."},{"id":"c","label":"Self-employment has no risk."},{"id":"d","label":"Self-employed people do not need customers."}],"explanations":{"a":"Self-employment often still depends on direct personal effort.","b":"Correct. More control can coexist with time-dependent income and risk.","c":"Self-employment can involve customer, income, operating, and other risks.","d":"Direct customer relationships are often central to self-employment."}},
      {"id":"q4","prompt":"What does economic leverage mean in this lesson?","choices":[{"id":"a","label":"Borrowing as much money as possible."},{"id":"b","label":"Avoiding work."},{"id":"c","label":"Using systems, assets, technology, capital, people, or intellectual property so personal effort can support greater economic output."},{"id":"d","label":"Working more hours."}],"explanations":{"a":"Borrowing is not the definition of leverage used here.","b":"Leverage is not a promise of avoiding effort, oversight, or risk.","c":"Correct. Leverage describes how effort can be supported by systems or productive resources.","d":"More hours may increase active work, but do not by themselves create leverage."}},
      {"id":"q5","prompt":"Which statement is most accurate?","choices":[{"id":"a","label":"Employment is always exploitation."},{"id":"b","label":"Business ownership guarantees wealth."},{"id":"c","label":"Different forms of work involve different combinations of labor, ownership, risk, control, and leverage."},{"id":"d","label":"Everyone should quit their job."}],"explanations":{"a":"The lesson does not label employment as inherently bad.","b":"Ownership can involve capital, maintenance, management, risk, and potential loss.","c":"Correct. The lesson examines economic structure without assigning human value or prescribing one path.","d":"The lesson is educational, not a directive to leave employment."}}
    ]'::jsonb,
    '{"q1":"b","q2":"b","q3":"b","q4":"c","q5":"c"}'::jsonb,
    4
  )
  on conflict (lesson_id) do update set
    questions = excluded.questions,
    answer_key = excluded.answer_key,
    passing_score = excluded.passing_score;
end;
$$;

commit;
