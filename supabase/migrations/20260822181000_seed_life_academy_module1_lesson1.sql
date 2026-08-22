-- Seed only the approved Phase 1 curriculum. No learner, profile, progress, response, or completion data is created.
with course as (
  insert into public.academy_courses (slug, title, summary, status, position)
  values ('life-academy', '7Tribes Life Academy', 'Practical civic and economic learning for community capability.', 'published', 1)
  on conflict (slug) do update set title = excluded.title, summary = excluded.summary, status = excluded.status
  returning id
), module as (
  insert into public.academy_modules (course_id, slug, title, summary, status, position)
  select id, 'how-america-works', 'How America Works', 'Understand systems before trying to change them.', 'published', 1 from course
  on conflict (course_id, slug) do update set title = excluded.title, summary = excluded.summary, status = excluded.status
  returning id
), lesson as (
  insert into public.academy_lessons (module_id, slug, title, summary, estimated_minutes, status, position, lesson_content)
  select id, 'understand-the-system', 'Understand the System', 'Learn to read people, incentives, rules, resources, and decisions as a community system.', 12, 'published', 1,
  '{"version":1,"type":"lesson"}'::jsonb from module
  on conflict (module_id, slug) do update set title = excluded.title, summary = excluded.summary, estimated_minutes = excluded.estimated_minutes, status = excluded.status, lesson_content = excluded.lesson_content
  returning id
)
insert into public.academy_lesson_quizzes (lesson_id, questions, answer_key, passing_score)
select id,
'[{"id":"q1","prompt":"Which description best defines a community system?"},{"id":"q2","prompt":"What is the most useful first action before proposing a solution?"},{"id":"q3","prompt":"Which form of value can move through a community system?"}]'::jsonb,
'{"q1":"b","q2":"a","q3":"c"}'::jsonb, 3 from lesson
on conflict (lesson_id) do update set questions = excluded.questions, answer_key = excluded.answer_key, passing_score = excluded.passing_score;
