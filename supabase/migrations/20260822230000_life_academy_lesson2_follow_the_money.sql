-- 7Tribes Life Academy — Lesson 2: Follow the Money
-- Idempotent curriculum, private-exercise, RLS, quiz-feedback, and completion-gate extension.
-- This migration never inserts learner, progress, response, quiz-attempt, or completion data.

begin;

create table if not exists public.academy_lesson_exercise_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  exercise_key text not null check (char_length(exercise_key) between 1 and 120),
  response jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id, exercise_key)
);

create index if not exists academy_lesson_exercise_responses_lesson_idx
  on public.academy_lesson_exercise_responses (lesson_id, exercise_key);

drop trigger if exists set_academy_lesson_exercise_responses_updated_at on public.academy_lesson_exercise_responses;
create trigger set_academy_lesson_exercise_responses_updated_at
  before update on public.academy_lesson_exercise_responses
  for each row execute procedure public.set_academy_updated_at();

alter table public.academy_lesson_exercise_responses enable row level security;

drop policy if exists "own or founder lesson exercises" on public.academy_lesson_exercise_responses;
create policy "own or founder lesson exercises" on public.academy_lesson_exercise_responses
  for select using (auth.uid() = user_id or public.is_academy_founder());

drop policy if exists "learners insert own lesson exercises" on public.academy_lesson_exercise_responses;
create policy "learners insert own lesson exercises" on public.academy_lesson_exercise_responses
  for insert with check (auth.uid() = user_id);

drop policy if exists "learners update own lesson exercises" on public.academy_lesson_exercise_responses;
create policy "learners update own lesson exercises" on public.academy_lesson_exercise_responses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "founders manage lesson exercises" on public.academy_lesson_exercise_responses;
create policy "founders manage lesson exercises" on public.academy_lesson_exercise_responses
  for all using (public.is_academy_founder()) with check (public.is_academy_founder());

-- Return answer-specific teaching feedback after an authenticated quiz attempt without exposing answer keys.
create or replace function public.submit_academy_quiz(p_lesson_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_questions jsonb;
  v_answer_key jsonb;
  v_passing_score integer;
  v_score integer := 0;
  v_question jsonb;
  v_passed boolean;
  v_feedback jsonb := '[]'::jsonb;
  v_question_id text;
  v_selected text;
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
    v_question_id := v_question ->> 'id';
    v_selected := p_answers ->> v_question_id;
    if v_selected = v_answer_key ->> v_question_id then
      v_score := v_score + 1;
    end if;
    v_feedback := v_feedback || jsonb_build_array(jsonb_build_object(
      'id', v_question_id,
      'correct', v_selected = v_answer_key ->> v_question_id,
      'explanation', coalesce(v_question -> 'explanations' ->> v_selected, v_question ->> 'explanation', 'Review this part of the lesson and try again.')
    ));
  end loop;

  v_passed := v_score >= v_passing_score;

  insert into public.academy_quiz_attempts (user_id, lesson_id, submitted_answers, score, passed)
  values (auth.uid(), p_lesson_id, coalesce(p_answers, '{}'::jsonb), v_score, v_passed);

  return jsonb_build_object('score', v_score, 'passed', v_passed, 'feedback', v_feedback);
end;
$$;

create or replace function public.complete_academy_lesson2(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sections jsonb;
  v_required_sections jsonb := '["gross-pay","spend-money","revenue-profit","hundred-journey","circulation","two-communities","trade","bread","supply-chain","capability-gap","knowledge-check"]'::jsonb;
  v_quiz_passed boolean;
  v_required_exercises boolean;
  v_required_scenarios boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select completed_sections into v_sections
  from public.academy_lesson_progress
  where user_id = auth.uid() and lesson_id = p_lesson_id;

  if coalesce(v_sections, '[]'::jsonb) @> v_required_sections is false then
    raise exception 'Read each Lesson 2 section before completion';
  end if;

  select exists (
    select 1 from public.academy_quiz_attempts
    where user_id = auth.uid() and lesson_id = p_lesson_id and passed = true
  ) into v_quiz_passed;

  if not v_quiz_passed then
    raise exception 'Pass the Lesson 2 Knowledge Check before completion';
  end if;

  select (
    exists (
      select 1 from public.academy_lesson_exercise_responses
      where user_id = auth.uid() and lesson_id = p_lesson_id and exercise_key = 'hundred-journey'
    )
    and exists (
      select 1 from public.academy_lesson_exercise_responses
      where user_id = auth.uid() and lesson_id = p_lesson_id and exercise_key = 'supply-chain'
        and jsonb_typeof(response -> 'items') = 'array'
        and jsonb_array_length(response -> 'items') >= 5
    )
    and exists (
      select 1 from public.academy_lesson_exercise_responses
      where user_id = auth.uid() and lesson_id = p_lesson_id and exercise_key = 'capability-gap'
    )
  ) into v_required_exercises;

  if not v_required_exercises then
    raise exception 'Complete the $100 Journey, supply-chain, and capability-gap exercises before completion';
  end if;

  select count(distinct scenario_key) = 4 into v_required_scenarios
  from public.academy_scenario_responses
  where user_id = auth.uid()
    and lesson_id = p_lesson_id
    and scenario_key in ('gross-pay', 'revenue-profit', 'two-communities', 'trade');

  if not v_required_scenarios then
    raise exception 'Complete each Lesson 2 interactive question before completion';
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

revoke all on function public.complete_academy_lesson2(uuid) from public;
grant execute on function public.complete_academy_lesson2(uuid) to authenticated;

create or replace function public.track_academy_lesson_section(p_lesson_id uuid, p_section text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sections jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.academy_lessons
    where id = p_lesson_id
      and (status = 'published' or public.is_academy_founder())
  ) then
    raise exception 'Published lesson not found';
  end if;

  insert into public.academy_lesson_progress (
    user_id, lesson_id, current_section, completed_sections, last_seen_at
  ) values (
    auth.uid(), p_lesson_id, p_section, jsonb_build_array(p_section), now()
  )
  on conflict (user_id, lesson_id) do update
    set current_section = excluded.current_section,
        completed_sections = case
          when public.academy_lesson_progress.completed_sections @> jsonb_build_array(p_section)
            then public.academy_lesson_progress.completed_sections
          else public.academy_lesson_progress.completed_sections || jsonb_build_array(p_section)
        end,
        last_seen_at = excluded.last_seen_at
  returning completed_sections into v_sections;

  return jsonb_build_object('completed_sections', v_sections);
end;
$$;

revoke all on function public.track_academy_lesson_section(uuid, text) from public;
grant execute on function public.track_academy_lesson_section(uuid, text) to authenticated;

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
    'follow-the-money',
    'Follow the Money',
    'Learn how money moves through households, businesses, supply chains, governments, and communities.',
    22,
    'published',
    2,
    '{
      "version": 2,
      "type": "lesson",
      "sections": [
        {"key":"gross-pay","eyebrow":"From Gross Pay to Spendable Money","heading":"You Earned $1,000. Did You Receive $1,000?","paragraphs":["Gross pay is the amount earned before applicable withholding and deductions. A $1,000 gross paycheck does not automatically mean $1,000 reaches a bank account.","Possible deductions can include federal income-tax withholding, Social Security, Medicare, state or local taxes where applicable, health insurance, retirement contributions, and other authorized deductions. Actual deductions vary by person, employment situation, benefits, and jurisdiction."],"diagram":["GROSS PAY","WITHHOLDING / DEDUCTIONS","NET PAY"],"notice":"Teaching example only. Actual deductions vary; this lesson does not estimate anyone’s taxes or take-home pay."},
        {"key":"spend-money","eyebrow":"You Spend $100","heading":"Revenue is not automatically profit.","paragraphs":["Imagine taking $100 of available money and spending it at a neighborhood restaurant. The restaurant receives revenue, not necessarily $100 of profit.","The next question is not only who received the payment. It is what obligations, expenses, owners, workers, suppliers, and institutions connect to it next."]},
        {"key":"revenue-profit","eyebrow":"Revenue − Expenses = Profit","heading":"A business can receive money and still have many obligations.","paragraphs":["In a hypothetical business with $500,000 in annual revenue and $450,000 in annual expenses, $50,000 remains before considering additional applicable adjustments or taxes.","Expenses differ significantly across businesses. They can include inventory or materials, labor, rent, utilities, insurance, payment processing, equipment, transportation, accounting, technology, marketing, taxes, and maintenance."],"diagram":["$500,000 REVENUE","− $450,000 EXPENSES","= $50,000 BEFORE ADDITIONAL ADJUSTMENTS"],"notice":"Hypothetical teaching example only. It does not estimate any company’s finances."},
        {"key":"hundred-journey","eyebrow":"Signature Exercise","heading":"Follow This $100","paragraphs":["This visual shows one clearly labeled teaching example of how restaurant revenue might be allocated. It is not a typical restaurant budget.","Choose a path to see how one portion can continue into another transaction or leave the defined community through an outside supplier."]},
        {"key":"circulation","eyebrow":"What Is Economic Circulation?","heading":"A dollar can become somebody else’s revenue or income.","paragraphs":["A dollar does not disappear when it is spent. It can become somebody else’s revenue or income and may participate in another transaction.","Circulation is one part of a larger system involving production, consumption, ownership, trade, investment, savings, expenses, taxes, imports, and exports. It does not mean money permanently remains inside a geographic boundary or automatically creates wealth."]},
        {"key":"two-communities","eyebrow":"Two Communities","heading":"The same household income can connect to different economic systems.","paragraphs":["Two hypothetical communities can each receive $1,000,000 in household income while having different productive capacity, ownership, supplier relationships, skills, infrastructure, and trade patterns.","Household income alone does not show what a community produces, who owns productive assets, where businesses buy inputs, how much is imported, or where profits ultimately go."],"notice":"Hypothetical comparison only. It does not rank, diagnose, or measure any actual community."},
        {"key":"trade","eyebrow":"Trade Is Not the Enemy","heading":"A Strong Community Does Not Have to Produce Everything","paragraphs":["Modern economies depend on trade. Communities may reasonably purchase specialized technology, medicine, machinery, vehicles, raw materials, software, professional services, or goods produced more efficiently elsewhere.","Produce what makes sense. Build useful capabilities. Trade for what makes sense. Understand dependencies."],"definition":"Productive capacity is what people, businesses, skills, equipment, property, technology, and institutions are actually capable of producing or providing."},
        {"key":"bread","eyebrow":"Supply-Chain Thinking","heading":"A Loaf of Bread Is More Than Bread","paragraphs":["One ordinary product can reveal an entire economic system. Grain, milling, ingredients, packaging, equipment, transport, warehousing, retail property, finance, insurance, accounting, and technology can all be part of the chain."]},
        {"key":"supply-chain","eyebrow":"Private Household Supply-Chain Exercise","heading":"Investigate five regular purchases.","paragraphs":["Record five products or services your household regularly purchases. Unknown or I do not know is a legitimate answer. The purpose is investigation, not pretending you already know every supply chain.","Your entries are private and become input for future personal capability work; this task does not build a Community Capability Map."]},
        {"key":"capability-gap","eyebrow":"Private Capability-Gap Exercise","heading":"Find one capability gap.","paragraphs":["Identify one product or service your community regularly purchases but appears to have limited local capacity to provide. Then consider what might be missing and what would have to change.","Your response is private. It does not create a public business listing, economic claim, or recommendation."]},
        {"key":"knowledge-check","eyebrow":"Knowledge Check","heading":"Prove you understand the system underneath a transaction.","paragraphs":["This scenario-based check covers gross versus net pay, revenue versus profit, operating expenses, circulation, productive capacity, supply chains, trade, and dependency. Each response receives a short teaching explanation."]}
      ],
      "hundred_journey": {"notice":"Teaching example only. These figures do not represent typical restaurant finances.","allocations":[{"label":"Labor","amount":30,"path":["Restaurant","Employee","Grocery Store","Supplier"]},{"label":"Suppliers","amount":20,"path":["Restaurant","Local Supplier","Delivery Company","Worker"]},{"label":"Utilities","amount":15,"path":["Restaurant","Utility provider","Workers and equipment"]},{"label":"Taxes","amount":10,"path":["Restaurant","Public revenue","Services and obligations"]},{"label":"Outside Suppliers","amount":10,"path":["Restaurant","Outside supplier","Leaves defined community"]},{"label":"Other Operating Expenses","amount":10,"path":["Restaurant","Operating services","Workers and vendors"]},{"label":"Profit","amount":5,"path":["Restaurant","Owner or retained business funds","Future decisions"]}]},
      "bread_chain":["Grain grower","Mill","Ingredient provider","Packaging maker","Bakery","Transport and warehouse","Retailer","Retail property","Finance, insurance, accounting, and technology"]
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
      {"id":"q1","prompt":"If gross pay is $1,000, what can be concluded about the amount that reaches a bank account?","choices":[{"id":"a","label":"It must be exactly $1,000."},{"id":"b","label":"It may differ after applicable withholding and authorized deductions."},{"id":"c","label":"It must be zero."}],"explanations":{"a":"Gross pay is the pre-deduction amount, so it does not automatically equal net pay.","b":"Correct. Net pay can differ because withholding and authorized deductions vary by situation.","c":"Gross pay does not imply a zero bank deposit; the point is that deductions can change the amount."}},
      {"id":"q2","prompt":"A hypothetical business has $500,000 in revenue and $450,000 in expenses. What remains before additional applicable adjustments or taxes?","choices":[{"id":"a","label":"$50,000"},{"id":"b","label":"$450,000"},{"id":"c","label":"$500,000"}],"explanations":{"a":"Correct. Revenue minus expenses equals $50,000 in this hypothetical example.","b":"$450,000 is the stated expense total, not what remains after expenses.","c":"$500,000 is revenue before subtracting the stated expenses."}},
      {"id":"q3","prompt":"When a customer spends $100 at a restaurant, what is the best first interpretation?","choices":[{"id":"a","label":"The restaurant earned $100 of profit."},{"id":"b","label":"The restaurant received $100 of revenue that may be used for expenses, obligations, or profit."},{"id":"c","label":"The money disappeared after payment."}],"explanations":{"a":"Revenue is not the same as profit because operating expenses and obligations still matter.","b":"Correct. Revenue can be used for labor, suppliers, rent, utilities, taxes, other expenses, or profit.","c":"A payment can become another person’s revenue or income; it does not simply disappear."}},
      {"id":"q4","prompt":"Which statement best describes economic circulation?","choices":[{"id":"a","label":"Money permanently remains within one geographic boundary."},{"id":"b","label":"Every dollar automatically creates wealth."},{"id":"c","label":"A payment can become another person’s income or revenue and may participate in later transactions."}],"explanations":{"a":"Money can move across boundaries through trade, suppliers, taxes, savings, and many other paths.","b":"Circulation alone does not automatically create wealth.","c":"Correct. Circulation describes how a payment can connect to additional transactions."}},
      {"id":"q5","prompt":"What does productive capacity describe?","choices":[{"id":"a","label":"What people, businesses, skills, equipment, property, technology, and institutions can provide or produce."},{"id":"b","label":"Only the amount of household income received."},{"id":"c","label":"Only the number of businesses registered in a place."}],"explanations":{"a":"Correct. Productive capacity is broader than income or business count.","b":"Household income is one data point, not a full picture of productive capacity.","c":"Business count alone does not reveal skills, assets, supply chains, or what can actually be provided."}},
      {"id":"q6","prompt":"Why can a loaf of bread reveal a larger economic system?","choices":[{"id":"a","label":"It has no relationship to other businesses."},{"id":"b","label":"It can involve growers, mills, ingredients, packaging, equipment, transport, retail, property, and services."},{"id":"c","label":"It is produced by one institution alone."}],"explanations":{"a":"Ordinary products often depend on many people, businesses, assets, and services.","b":"Correct. A supply chain can make the relationships behind an everyday product visible.","c":"A supply chain usually includes more than one institution or business."}},
      {"id":"q7","prompt":"What is the most useful approach to trade?","choices":[{"id":"a","label":"Avoid all outside purchases."},{"id":"b","label":"Produce what makes sense, build useful capabilities, trade for what makes sense, and understand dependencies."},{"id":"c","label":"Assume every outside supplier is harmful."}],"explanations":{"a":"Modern economies depend on trade; the lesson does not teach isolation.","b":"Correct. The goal is to understand capabilities and dependencies, not produce everything locally.","c":"Outside suppliers can provide specialized goods and services that make sense to trade for."}},
      {"id":"q8","prompt":"Why can two communities with the same household income be in different economic positions?","choices":[{"id":"a","label":"Income alone does not show production, ownership, inputs, skills, infrastructure, imports, or where profits go."},{"id":"b","label":"They must have exactly the same economic system."},{"id":"c","label":"Household income is the only economic fact that matters."}],"explanations":{"a":"Correct. Economic position depends on more than the amount of household income received.","b":"Similar income totals can connect to different ownership, supply-chain, and productive-capacity patterns.","c":"Income is important but does not reveal the full system underneath it."}}
    ]'::jsonb,
    '{"q1":"b","q2":"a","q3":"b","q4":"c","q5":"a","q6":"b","q7":"b","q8":"a"}'::jsonb,
    6
  )
  on conflict (lesson_id) do update set
    questions = excluded.questions,
    answer_key = excluded.answer_key,
    passing_score = excluded.passing_score;
end;
$$;

commit;
