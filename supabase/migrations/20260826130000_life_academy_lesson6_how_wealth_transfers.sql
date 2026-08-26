-- 7Tribes Life Academy — Lesson 6: How Wealth Transfers
-- Idempotent curriculum extension. It never creates learner, progress, response, quiz-attempt, or completion data.

begin;

create or replace function public.complete_academy_lesson6(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_sections jsonb;
  v_required_sections jsonb := '["wealth-not-money","transaction-sides","consumption-assets","ownership-destination","transfer-channels","renting-owning","interest-debt","intergenerational","wealth-destruction","circulation-effect","community-capacity","follow-100","follow-own-money","knowledge-check"]'::jsonb;
  v_quiz_passed boolean;
  v_exercise_complete boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.academy_lessons
    where id = p_lesson_id and slug = 'how-wealth-transfers' and status = 'published'
  ) then
    raise exception 'Published Lesson 6 not found';
  end if;

  select completed_sections into v_sections
  from public.academy_lesson_progress
  where user_id = auth.uid() and lesson_id = p_lesson_id;

  if coalesce(v_sections, '[]'::jsonb) @> v_required_sections is false then
    raise exception 'Read each Lesson 6 section before completion';
  end if;

  select exists (
    select 1 from public.academy_quiz_attempts
    where user_id = auth.uid() and lesson_id = p_lesson_id and passed = true
  ) into v_quiz_passed;

  if not v_quiz_passed then
    raise exception 'Pass the Lesson 6 Knowledge Check before completion';
  end if;

  select exists (
    select 1 from public.academy_lesson_exercise_responses
    where user_id = auth.uid()
      and lesson_id = p_lesson_id
      and exercise_key = 'follow-own-money'
      and response ?& array['earned_source','spending_categories','consumption_payments','asset_capability_payments','next_change']
      and jsonb_typeof(response -> 'spending_categories') = 'array'
      and jsonb_array_length(response -> 'spending_categories') >= 1
      and coalesce(response ->> 'earned_source','') <> ''
      and coalesce(response ->> 'consumption_payments','') <> ''
      and coalesce(response ->> 'asset_capability_payments','') <> ''
      and coalesce(response ->> 'next_change','') <> ''
  ) into v_exercise_complete;

  if not v_exercise_complete then
    raise exception 'Complete Follow Your Own Money before finishing Lesson 6';
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

revoke all on function public.complete_academy_lesson6(uuid) from public;
revoke execute on function public.complete_academy_lesson6(uuid) from anon;
grant execute on function public.complete_academy_lesson6(uuid) to authenticated;

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
    'how-wealth-transfers',
    'How Wealth Transfers',
    'Learn how money, assets, ownership, debt, capability, and productive capacity move between people, businesses, institutions, communities, and generations.',
    32,
    'published',
    6,
    '{
      "version": 1,
      "type": "lesson",
      "sections": [
        {"key":"wealth-not-money","heading":"Money is not the same as wealth"},
        {"key":"transaction-sides","heading":"Every transaction has two sides"},
        {"key":"consumption-assets","heading":"Consumption versus asset acquisition"},
        {"key":"ownership-destination","heading":"The ownership destination"},
        {"key":"transfer-channels","heading":"Five common wealth-transfer channels"},
        {"key":"renting-owning","heading":"Renting and owning"},
        {"key":"interest-debt","heading":"Interest and debt"},
        {"key":"intergenerational","heading":"Intergenerational wealth transfer"},
        {"key":"wealth-destruction","heading":"Wealth can also be destroyed"},
        {"key":"circulation-effect","heading":"The circulation effect"},
        {"key":"community-capacity","heading":"Community wealth capacity"},
        {"key":"follow-100","heading":"Follow $100"},
        {"key":"follow-own-money","heading":"Follow Your Own Money"},
        {"key":"knowledge-check","heading":"Knowledge Check"}
      ],
      "follow_100": {
        "disclaimer": "Illustrative teaching model only. It is not actual economic data, a personal financial plan, or an ecosystem metric.",
        "start_amount": 100,
        "default_path": "local_business",
        "default_allocations": {"supplier":35,"labor":25,"overhead":15,"obligations":10,"reinvestment":10,"remainder":5}
      },
      "capability_exercise": {"key":"follow-own-money","title":"Follow Your Own Money"}
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
      {"id":"q1","prompt":"Which statement best describes the difference between income and wealth?","choices":[{"id":"a","label":"Income and wealth always mean the same thing."},{"id":"b","label":"Income is a flow over time; wealth is a stock of accumulated net economic value at a point in time."},{"id":"c","label":"Wealth is only cash held in a bank."}],"explanations":{"a":"Income and wealth are related but distinct economic concepts.","b":"Correct. Income is received over time, while wealth describes accumulated assets net of liabilities at a point in time.","c":"Cash can be an asset, but wealth can also include other assets, interests, skills, and productive capacity."}},
      {"id":"q2","prompt":"In a simplified educational model, what does assets minus liabilities describe?","choices":[{"id":"a","label":"Net economic value or net worth."},{"id":"b","label":"A guaranteed annual income."},{"id":"c","label":"The amount of every future transaction."}],"explanations":{"a":"Correct. Assets minus liabilities is a simplified way to describe net worth or net economic value.","b":"Income is a flow, not the same as assets minus liabilities.","c":"A net-worth calculation does not determine every future transaction."}},
      {"id":"q3","prompt":"What is the best first interpretation of a customer paying $50 to a business for a product?","choices":[{"id":"a","label":"The customer exchanged money for something considered worth purchasing, while the business received revenue that may later meet obligations."},{"id":"b","label":"The customer lost $50 and the business gained $50 of profit."},{"id":"c","label":"No value moved because money was spent."}],"explanations":{"a":"Correct. A transaction has two sides, and revenue is not automatically profit.","b":"The customer received something in exchange, and business revenue may later pay expenses, obligations, or owners.","c":"Money and the product or service both changed hands."}},
      {"id":"q4","prompt":"Which statement is most accurate about consumption and asset acquisition?","choices":[{"id":"a","label":"All consumption is bad and all assets guarantee returns."},{"id":"b","label":"People need consumption, while spending that acquires or improves a durable or productive asset can affect future wealth differently without guaranteeing a return."},{"id":"c","label":"Every purchase is an asset acquisition."}],"explanations":{"a":"The lesson does not shame necessary consumption or promise returns.","b":"Correct. The economic effects can differ, but outcomes depend on circumstances and risk.","c":"Many purchases provide immediate use without creating a durable or productive asset."}},
      {"id":"q5","prompt":"What is a key tradeoff of borrowing in the debt example?","choices":[{"id":"a","label":"Borrowing always eliminates risk because capital arrives sooner."},{"id":"b","label":"Borrowing can provide earlier access to capital but creates an obligation to repay, usually with financing costs."},{"id":"c","label":"Debt and ownership never affect each other."}],"explanations":{"a":"Borrowing can introduce repayment, financing, and asset risks.","b":"Correct. The lesson frames borrowing as an agreement with both access and obligations.","c":"Debt can affect risk, cash flow, claims, and the economic value remaining to an owner."}},
      {"id":"q6","prompt":"Which is an example of capability capital passing between generations?","choices":[{"id":"a","label":"Teaching business skills, a trade, technology, or professional knowledge."},{"id":"b","label":"Assuming knowledge transfers automatically without teaching or practice."},{"id":"c","label":"Claiming only inherited cash can matter economically."}],"explanations":{"a":"Correct. Skills, knowledge, and networks can transfer economic capability even without large financial assets.","b":"Capability normally depends on intentional teaching, learning, and practice.","c":"Financial capital matters, but it is not the only form of economic capacity."}},
      {"id":"q7","prompt":"What does the circulation lesson say about repeated transactions?","choices":[{"id":"a","label":"They magically multiply the original amount of money."},{"id":"b","label":"They can represent additional economic activity, while communities still depend on regional, national, and global trade."},{"id":"c","label":"They mean every dollar must remain inside one community."}],"explanations":{"a":"The lesson explicitly avoids claiming that circulation magically multiplies money.","b":"Correct. The goal is to understand value flows and build useful local productive capacity where it makes sense.","c":"Communities cannot realistically keep every dollar within a single boundary."}},
      {"id":"q8","prompt":"Which group of resources best reflects community productive capacity?","choices":[{"id":"a","label":"Skilled people, businesses, productive assets, land or infrastructure, capital, and organization or networks."},{"id":"b","label":"Money alone, regardless of skills or institutions."},{"id":"c","label":"Only consumer spending."}],"explanations":{"a":"Correct. Community wealth capacity is broader than money alone.","b":"Money without productive capacity can still require extensive external purchasing.","c":"Consumer spending is one activity, not a complete measure of community productive capacity."}}
    ]'::jsonb,
    '{"q1":"b","q2":"a","q3":"a","q4":"b","q5":"b","q6":"a","q7":"b","q8":"a"}'::jsonb,
    6
  )
  on conflict (lesson_id) do update set
    questions = excluded.questions,
    answer_key = excluded.answer_key,
    passing_score = excluded.passing_score;
end;
$$;

commit;
