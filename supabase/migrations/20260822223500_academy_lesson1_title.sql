-- Align the existing published Lesson 1 label with the approved Academy V1 roadmap.
-- Deliberately preserves the lesson slug, content, and all learner-linked records.

update public.academy_lessons
set title = 'Who Actually Runs What?'
where slug = 'understand-the-system'
  and title is distinct from 'Who Actually Runs What?';
