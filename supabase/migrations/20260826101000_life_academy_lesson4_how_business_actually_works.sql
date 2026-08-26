-- 7Tribes Life Academy — Lesson 4: How Business Actually Works
-- Idempotent curriculum extension. It never creates learner, progress, response, quiz-attempt, or completion data.

begin;

create or replace function public.complete_academy_lesson4(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sections jsonb;
  v_required_sections jsonb := '["business-problem","revenue-profit","money-flow","sales-ownership","tshirt-supply-chain","system-self-employment","dependency-exercise","local-multiplier","business-dashboard","map-real-business","knowledge-check"]'::jsonb;
  v_quiz_passed boolean;
  v_exercise_complete boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.academy_lessons
    where id = p_lesson_id
      and slug = 'how-business-actually-works'
      and status = 'published'
  ) then
    raise exception 'Published Lesson 4 not found';
  end if;

  select completed_sections into v_sections
  from public.academy_lesson_progress
  where user_id = auth.uid() and lesson_id = p_lesson_id;

  if coalesce(v_sections, '[]'::jsonb) @> v_required_sections is false then
    raise exception 'Read each Lesson 4 section before completion';
  end if;

  select exists (
    select 1 from public.academy_quiz_attempts
    where user_id = auth.uid() and lesson_id = p_lesson_id and passed = true
  ) into v_quiz_passed;

  if not v_quiz_passed then
    raise exception 'Pass the Lesson 4 Knowledge Check before completion';
  end if;

  select exists (
    select 1 from public.academy_lesson_exercise_responses
    where user_id = auth.uid()
      and lesson_id = p_lesson_id
      and exercise_key = 'map-real-business'
      and response ?& array['business','offers','customers','revenue','suppliers','owned_assets','rented_resources','supplier_disruption','dollar_path','resilience']
      and jsonb_typeof(response -> 'likely_expenses') = 'array'
      and jsonb_array_length(response -> 'likely_expenses') >= 5
      and coalesce(response ->> 'business','') <> ''
      and coalesce(response ->> 'offers','') <> ''
      and coalesce(response ->> 'customers','') <> ''
      and coalesce(response ->> 'revenue','') <> ''
      and coalesce(response ->> 'suppliers','') <> ''
      and coalesce(response ->> 'owned_assets','') <> ''
      and coalesce(response ->> 'rented_resources','') <> ''
      and coalesce(response ->> 'supplier_disruption','') <> ''
      and coalesce(response ->> 'dollar_path','') <> ''
      and coalesce(response ->> 'resilience','') <> ''
  ) into v_exercise_complete;

  if not v_exercise_complete then
    raise exception 'Complete Map a Real Business before finishing Lesson 4';
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

revoke all on function public.complete_academy_lesson4(uuid) from public;
grant execute on function public.complete_academy_lesson4(uuid) to authenticated;

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
    'how-business-actually-works',
    'How Business Actually Works',
    'Learn how businesses turn demand, labor, resources, systems, and capital into products or services, and where money goes through the system.',
    28,
    'published',
    4,
    '{
      "version": 1,
      "type": "lesson",
      "sections": [
        {"key":"business-problem","heading":"A business solves an economic problem"},
        {"key":"revenue-profit","heading":"Revenue is not profit"},
        {"key":"money-flow","heading":"Where business money goes"},
        {"key":"sales-ownership","heading":"Sales do not equal ownership"},
        {"key":"tshirt-supply-chain","heading":"The supply chain"},
        {"key":"system-self-employment","heading":"Business system versus self-employment"},
        {"key":"dependency-exercise","heading":"Control and dependency"},
        {"key":"local-multiplier","heading":"Local economic multiplier"},
        {"key":"business-dashboard","heading":"Business health dashboard"},
        {"key":"map-real-business","heading":"Map a real business"},
        {"key":"knowledge-check","heading":"Knowledge Check"}
      ],
      "simulator": {
        "default_monthly_customers": 100,
        "default_average_sale": 50,
        "default_cost_per_sale": 20,
        "default_fixed_expenses": 1200,
        "default_labor_expense": 1800
      }
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
      {"id":"q1","prompt":"A business receives $10,000 in revenue and has $8,000 in stated operating expenses before applicable taxes and other obligations. What remains in this educational example?","choices":[{"id":"a","label":"$10,000 of profit"},{"id":"b","label":"$8,000 of profit"},{"id":"c","label":"$2,000 before applicable taxes and other obligations"},{"id":"d","label":"No information can be known"}],"explanations":{"a":"Revenue is the money received before subtracting costs and obligations.","b":"$8,000 is the stated expense total, not what remains after those expenses.","c":"Correct. The illustrative operating result is revenue minus the stated expenses: $2,000 before applicable taxes and other obligations.","d":"The example provides enough information to calculate the stated operating result."}},
      {"id":"q2","prompt":"What can registering a legal entity do by itself?","choices":[{"id":"a","label":"It can create a legal entity, but not automatically customers, delivery, revenue, or a functioning business system."},{"id":"b","label":"It automatically creates profit."},{"id":"c","label":"It removes the need to solve a customer problem."}],"explanations":{"a":"Correct. Legal formation and economic activity are related but not the same thing.","b":"A legal entity does not guarantee revenue or profit.","c":"A functioning business still needs an exchange that customers value."}},
      {"id":"q3","prompt":"Which cost is most likely variable with each sale?","choices":[{"id":"a","label":"Packaging or materials used for each item sold"},{"id":"b","label":"A fixed monthly lease payment"},{"id":"c","label":"A business name"}],"explanations":{"a":"Correct. Materials or packaging often rise with the number of products or services delivered.","b":"A monthly lease is commonly fixed for the relevant period, even though contracts can change over time.","c":"A business name is not a per-sale operating cost."}},
      {"id":"q4","prompt":"In the T-shirt example, which statement is most accurate?","choices":[{"id":"a","label":"The retailer is the only participant who captures value."},{"id":"b","label":"Several participants can receive revenue or margins across raw materials, production, distribution, and retail."},{"id":"c","label":"A customer payment has no relationship to suppliers."}],"explanations":{"a":"Retail is one stage, not the entire supply chain.","b":"Correct. Different participants can provide inputs, production, distribution, or retail and receive revenue or margins.","c":"Customer payments can support several connected transactions through a supply chain."}},
      {"id":"q5","prompt":"Which statement about asset ownership is most accurate?","choices":[{"id":"a","label":"A company is not a real business unless it owns every building and machine it uses."},{"id":"b","label":"A business can rent or lease resources and still be real, while ownership of productive assets can affect control and resilience."},{"id":"c","label":"Asset ownership never affects a business."}],"explanations":{"a":"Businesses can operate with rented or leased resources.","b":"Correct. The lesson distinguishes a functioning business from the level of control it has over critical productive infrastructure.","c":"Ownership can change control, risk, resilience, and the share of value a business may retain."}},
      {"id":"q6","prompt":"What structural difference can separate self-employment from a business system?","choices":[{"id":"a","label":"Self-employment has no customers."},{"id":"b","label":"A system can use repeatable processes, people, technology, assets, or other capacity so output is less dependent on every hour of the owner personal labor."},{"id":"c","label":"Business systems never require an owner to work."}],"explanations":{"a":"Self-employed people usually depend on customers or clients.","b":"Correct. This is a structural distinction, not a claim that self-employment is inferior.","c":"Systems still require oversight, decisions, and may involve significant owner work."}},
      {"id":"q7","prompt":"Why should a business map critical dependencies such as suppliers, payment processors, or transportation?","choices":[{"id":"a","label":"To understand what access another organization could change and where contingency planning matters."},{"id":"b","label":"Because every dependency should be eliminated immediately."},{"id":"c","label":"Because customers are not important."}],"explanations":{"a":"Correct. Important dependencies can create operational risk, so identifying alternatives and contingency plans matters.","b":"Many dependencies are reasonable; the goal is understanding and planning, not isolation.","c":"Customers are a core dependency for most businesses."}},
      {"id":"q8","prompt":"What does the local circulation example show?","choices":[{"id":"a","label":"The original $50 becomes new money each time it changes hands."},{"id":"b","label":"The same original dollars can support several transactions before leaving a local network."},{"id":"c","label":"Every dollar always remains local."}],"explanations":{"a":"Repeated transactions do not create new money from the original payment.","b":"Correct. The example illustrates repeated economic activity using circulating money.","c":"Money can leave through suppliers, obligations, savings, trade, and other paths."}}
    ]'::jsonb,
    '{"q1":"c","q2":"a","q3":"a","q4":"b","q5":"b","q6":"b","q7":"a","q8":"b"}'::jsonb,
    6
  )
  on conflict (lesson_id) do update set
    questions = excluded.questions,
    answer_key = excluded.answer_key,
    passing_score = excluded.passing_score;
end;
$$;

commit;
