-- Academy V1 curriculum hierarchy correction
-- Preserves the existing published Lesson 1 and all learner-linked records.
-- Creates only empty coming-soon lesson shells; no Lesson 2–7 curriculum is seeded.

do $$
declare
  v_module_id uuid;
begin
  select id
    into v_module_id
  from public.academy_modules
  where slug = 'how-america-works'
  order by created_at asc
  limit 1;

  if v_module_id is null then
    raise exception 'Approved Module 1 (how-america-works) was not found';
  end if;

  update public.academy_modules
  set summary = 'Learn how government, money, work, business, ownership, wealth transfer, and community capability fit together—and how these systems affect everyday life.',
      status = 'published',
      position = 1
  where id = v_module_id;

  insert into public.academy_lessons (
    module_id,
    slug,
    title,
    summary,
    estimated_minutes,
    status,
    position,
    lesson_content
  )
  values
    (v_module_id, 'follow-the-money', 'Follow the Money', null, null, 'coming_soon', 2, '{}'::jsonb),
    (v_module_id, 'how-work-actually-works', 'How Work Actually Works', null, null, 'coming_soon', 3, '{}'::jsonb),
    (v_module_id, 'how-business-actually-works', 'How Business Actually Works', null, null, 'coming_soon', 4, '{}'::jsonb),
    (v_module_id, 'how-ownership-actually-works', 'How Ownership Actually Works', null, null, 'coming_soon', 5, '{}'::jsonb),
    (v_module_id, 'how-wealth-transfers', 'How Wealth Transfers', null, null, 'coming_soon', 6, '{}'::jsonb),
    (v_module_id, 'how-communities-build', 'How Communities Build', null, null, 'coming_soon', 7, '{}'::jsonb)
  on conflict (module_id, slug) do update
    set title = excluded.title,
        summary = null,
        estimated_minutes = null,
        status = 'coming_soon',
        position = excluded.position,
        lesson_content = '{}'::jsonb
  where public.academy_lessons.status = 'coming_soon'
    and public.academy_lessons.lesson_content = '{}'::jsonb;
end;
$$;
