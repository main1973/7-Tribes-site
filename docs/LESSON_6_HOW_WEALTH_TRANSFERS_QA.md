# Lesson 6 — How Wealth Transfers: QA Record

## Release scope

Lesson 6 is the sixth published lesson in Module 1, **How America Works**. It adds the approved wealth-transfer curriculum, a non-persistent **Follow $100** simulator, a private **Follow Your Own Money** capability exercise, an eight-question Knowledge Check, authenticated server-side completion, a founder-only curriculum editor, and a Lesson 6 roadmap entry.

## Database and security baseline

Migration `20260826130000_life_academy_lesson6_how_wealth_transfers.sql` applied successfully without inserting, resetting, or modifying learner progress, exercise responses, quiz attempts, completions, or user roles. The completion function explicitly revokes public and anonymous execution, grants execution only to `authenticated`, checks `auth.uid()`, requires the published Lesson 6 record, all required section keys, a passed private quiz attempt, and a complete private money-map response.

The post-migration security advisor lists `complete_academy_lesson6` only as an authenticated callable security-definer function, consistent with the protected Academy completion pattern. It does not report anonymous execution for the new Lesson 6 completion function. Existing intentional public quiz-reader and pre-existing Academy authenticated function advisories remain outside this Lesson 6 change.

## Verification log

Production route, Follow $100 reconciliation, mobile, private RLS, anonymous answer-key shape, founder-editor rendering, roadmap, and real-data persistence findings will be appended after deployment. No fabricated learner record may be used for these checks.
