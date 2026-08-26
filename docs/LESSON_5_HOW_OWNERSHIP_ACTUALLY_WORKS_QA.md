# Lesson 5 — How Ownership Actually Works: QA Record

## Release scope

Lesson 5 is the fifth published lesson in Module 1, **How America Works**. It adds the approved public ownership curriculum, a non-persistent Educational Ownership Analyzer, a private **Map What You Control and Own** capability exercise, an eight-question Knowledge Check, authenticated server-side completion, a founder-only curriculum editor, and a Lesson 5 roadmap entry.

## Database and security baseline

Migration `20260826112000_life_academy_lesson5_how_ownership_actually_works.sql` applied successfully without inserting, resetting, or modifying learner progress, exercise responses, quiz attempts, completions, or user roles. The Lesson 5 completion function explicitly revokes public and anonymous execution, grants execution only to `authenticated`, checks `auth.uid()`, requires the published Lesson 5 record, all required section keys, a passed private quiz attempt, and a complete private ownership-map response.

The post-migration security advisor reports the existing intentional public quiz-reader and existing Academy authenticated security-definer warnings. It reports `complete_academy_lesson5` only as callable by authenticated users; it does **not** report anonymous execution for that function. The function enforces the user-scoped prerequisites internally.

## Verification log

Production route, mobile, private RLS, anonymous answer-key shape, founder-editor rendering, roadmap, and real-data persistence findings will be appended after deployment. No fabricated learner record may be used for these checks.
