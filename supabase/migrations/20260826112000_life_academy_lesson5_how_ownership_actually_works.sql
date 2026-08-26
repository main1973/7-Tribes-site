-- 7Tribes Life Academy — Lesson 5: How Ownership Actually Works
-- Idempotent curriculum extension. It never creates learner, progress, response, quiz-attempt, or completion data.

begin;

create or replace function public.complete_academy_lesson5(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sections jsonb;
  v_required_sections jsonb := '["use-possession-control-ownership","assets","assets-liabilities","debt-ownership","business-ownership","ownership-percentages","ownership-income","infrastructure","ownership-ladder","collective-ownership","ownership-analyzer","map-control-own","knowledge-check"]'::jsonb;
  v_quiz_passed boolean;
  v_exercise_complete boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.academy_lessons
    where id = p_lesson_id and slug = 'how-ownership-actually-works' and status = 'published'
  ) then
    raise exception 'Published Lesson 5 not found';
  end if;

  select completed_sections into v_sections
  from public.academy_lesson_progress
  where user_id = auth.uid() and lesson_id = p_lesson_id;

  if coalesce(v_sections, '[]'::jsonb) @> v_required_sections is false then
    raise exception 'Read each Lesson 5 section before completion';
  end if;

  select exists (
    select 1 from public.academy_quiz_attempts
    where user_id = auth.uid() and lesson_id = p_lesson_id and passed = true
  ) into v_quiz_passed;

  if not v_quiz_passed then
    raise exception 'Pass the Lesson 5 Knowledge Check before completion';
  end if;

  select exists (
    select 1 from public.academy_lesson_exercise_responses
    where user_id = auth.uid()
      and lesson_id = p_lesson_id
      and exercise_key = 'map-control-own'
      and response ?& array['regular_relationships','desired_asset','why_ownership_matters','acquisition_resources','next_action']
      and jsonb_typeof(response -> 'regular_relationships') = 'array'
      and jsonb_array_length(response -> 'regular_relationships') >= 3
      and jsonb_typeof(response -> 'acquisition_resources') = 'array'
      and jsonb_array_length(response -> 'acquisition_resources') >= 1
      and coalesce(response ->> 'desired_asset','') <> ''
      and coalesce(response ->> 'why_ownership_matters','') <> ''
      and coalesce(response ->> 'next_action','') <> ''
      and not exists (
        select 1 from jsonb_array_elements(response -> 'regular_relationships') relationship
        where coalesce(relationship ->> 'item','') = ''
           or coalesce(relationship ->> 'arrangement','') = ''
      )
  ) into v_exercise_complete;

  if not v_exercise_complete then
    raise exception 'Complete Map What You Control and Own before finishing Lesson 5';
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

revoke all on function public.complete_academy_lesson5(uuid) from public;
revoke execute on function public.complete_academy_lesson5(uuid) from anon;
grant execute on function public.complete_academy_lesson5(uuid) to authenticated;

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
    'how-ownership-actually-works',
    'How Ownership Actually Works',
    'Learn how legal rights, control, benefits, risk, debt, business entities, and collective structures shape what ownership means in everyday economic life.',
    30,
    'published',
    5,
    '{
      "version": 1,
      "type": "lesson",
      "sections": [
        {"key":"use-possession-control-ownership","heading":"Use, possession, control, and ownership"},
        {"key":"assets","heading":"What is an asset?"},
        {"key":"assets-liabilities","heading":"Assets versus liabilities"},
        {"key":"debt-ownership","heading":"Debt and ownership"},
        {"key":"business-ownership","heading":"Business ownership"},
        {"key":"ownership-percentages","heading":"Ownership percentages"},
        {"key":"ownership-income","heading":"Ownership can produce income"},
        {"key":"infrastructure","heading":"Who owns the infrastructure?"},
        {"key":"ownership-ladder","heading":"The ownership ladder"},
        {"key":"collective-ownership","heading":"Individual versus collective ownership"},
        {"key":"ownership-analyzer","heading":"Educational Ownership Analyzer"},
        {"key":"map-control-own","heading":"Map What You Control and Own"},
        {"key":"knowledge-check","heading":"Knowledge Check"}
      ],
      "ownership_analyzer": {
        "asset_types": ["House","Car","Business","Equipment","Land","Digital asset"],
        "questions": ["Who possesses it?","Who legally owns it?","Is debt attached?","Who controls major decisions?","Who receives economic benefit?","Can ownership be transferred?","Are there other claims against it?"],
        "disclaimer": "Educational Ownership Analyzer — not legal, financial, tax, title, or investment advice."
      },
      "capability_exercise": {"key":"map-control-own","title":"Map What You Control and Own"}
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
      {"id":"q1","prompt":"Which statement best distinguishes possession from ownership?","choices":[{"id":"a","label":"Possession always proves full legal ownership."},{"id":"b","label":"A person can physically hold or occupy something without holding the full legal rights or interests in it."},{"id":"c","label":"Possession and access mean exactly the same thing in every situation."}],"explanations":{"a":"Physical possession alone does not always establish the full legal rights associated with ownership.","b":"Correct. Possession concerns holding or occupying something; ownership concerns legally recognized rights or interests and can be more complex.","c":"Access, possession, control, and ownership are related but distinct concepts."}},
      {"id":"q2","prompt":"A subscription customer generally has which relationship to the underlying platform?","choices":[{"id":"a","label":"Access to the service, not ownership of the underlying platform."},{"id":"b","label":"Automatic ownership of the company’s software and servers."},{"id":"c","label":"A security interest in every company asset."}],"explanations":{"a":"Correct. A subscription commonly provides contractual access to a service rather than ownership of the platform itself.","b":"Access to a service does not normally transfer ownership of the provider’s underlying assets.","c":"A customer subscription does not ordinarily create a lender-like security interest."}},
      {"id":"q3","prompt":"Which is an example of an intangible asset category?","choices":[{"id":"a","label":"A delivery vehicle."},{"id":"b","label":"A trademark or certain contractual right."},{"id":"c","label":"A monthly utility bill."}],"explanations":{"a":"A vehicle is generally a physical asset.","b":"Correct. Trademarks, copyrights, software, and certain contractual rights can be intangible assets, subject to applicable law and facts.","c":"A bill owed is generally an obligation rather than an owned resource with economic value."}},
      {"id":"q4","prompt":"In a simplified educational calculation, what does assets minus liabilities represent?","choices":[{"id":"a","label":"Net worth or equity."},{"id":"b","label":"Monthly income."},{"id":"c","label":"A guaranteed market value."}],"explanations":{"a":"Correct. Assets minus liabilities is a simplified way to describe net worth or equity.","b":"Income is a flow over time and is not the same as assets minus liabilities.","c":"Actual values can change with market conditions, costs, taxes, liens, and other facts."}},
      {"id":"q5","prompt":"What is the most accurate statement about debt secured by an asset?","choices":[{"id":"a","label":"Any debt automatically eliminates every ownership interest of the borrower."},{"id":"b","label":"Debt can give another party a legal claim or security interest without necessarily eliminating the borrower’s ownership interest."},{"id":"c","label":"Debt has no relationship to ownership, control, or risk."}],"explanations":{"a":"This is too simplistic. Rights can vary by agreement, title arrangement, and applicable law.","b":"Correct. A secured debt can create layered rights and obligations connected to an asset.","c":"Debt can affect risk, obligations, control, transfer, and the economic value remaining to an owner."}},
      {"id":"q6","prompt":"If a shareholder owns shares in a corporation that owns a building, what does the shareholder generally own?","choices":[{"id":"a","label":"A proportional physical piece of the building itself."},{"id":"b","label":"An ownership interest in the corporation, while the corporation owns the building."},{"id":"c","label":"No economic interest of any kind."}],"explanations":{"a":"The entity’s assets are generally distinct from an owner’s personal assets.","b":"Correct. The shareholder owns shares or an interest in the entity; the entity owns or controls its assets.","c":"An ownership interest can carry economic rights, but the precise rights depend on governing documents, class, agreements, and applicable law."}},
      {"id":"q7","prompt":"What does an ownership percentage by itself always tell you?","choices":[{"id":"a","label":"Everything about voting, control, distributions, and management authority."},{"id":"b","label":"Nothing at all about economic rights."},{"id":"c","label":"A share of ownership units, while the related rights can depend on agreements, classes, governing documents, and applicable law."}],"explanations":{"a":"Percentage alone may not define every right or decision-making rule.","b":"Ownership percentage can relate to economic rights, but those rights are not identical in every structure.","c":"Correct. Percentage is important, but it should not automatically be treated as unlimited control or a complete description of rights."}},
      {"id":"q8","prompt":"Which statement best reflects collective ownership?","choices":[{"id":"a","label":"People should pool money informally without defined responsibilities."},{"id":"b","label":"People and organizations can combine capital through legally defined structures, which require governance, accounting, contracts, and other responsibilities."},{"id":"c","label":"Collective ownership removes the need for decision-making or legal compliance."}],"explanations":{"a":"The lesson does not instruct informal pooling; structured collective arrangements can involve serious obligations.","b":"Correct. Partnerships, corporations, cooperatives, trusts, and other structures can combine capital, but responsibilities remain significant.","c":"Collective arrangements require decisions, governance, accounting, contracts, and compliance considerations."}}
    ]'::jsonb,
    '{"q1":"b","q2":"a","q3":"b","q4":"a","q5":"b","q6":"b","q7":"c","q8":"b"}'::jsonb,
    6
  )
  on conflict (lesson_id) do update set
    questions = excluded.questions,
    answer_key = excluded.answer_key,
    passing_score = excluded.passing_score;
end;
$$;

commit;
