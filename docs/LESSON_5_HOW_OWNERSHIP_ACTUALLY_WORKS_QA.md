# Lesson 5 — How Ownership Actually Works: QA Record

## Release scope

Lesson 5 is the fifth published lesson in Module 1, **How America Works**. It adds the approved public ownership curriculum, a non-persistent Educational Ownership Analyzer, a private **Map What You Control and Own** capability exercise, an eight-question Knowledge Check, authenticated server-side completion, a founder-only curriculum editor, and a Lesson 5 roadmap entry.

## Database and security baseline

Migration `20260826112000_life_academy_lesson5_how_ownership_actually_works.sql` applied successfully without inserting, resetting, or modifying learner progress, exercise responses, quiz attempts, completions, or user roles. The Lesson 5 completion function explicitly revokes public and anonymous execution, grants execution only to `authenticated`, checks `auth.uid()`, requires the published Lesson 5 record, all required section keys, a passed private quiz attempt, and a complete private ownership-map response.

The post-migration security advisor reports the existing intentional public quiz-reader and existing Academy authenticated security-definer warnings. It reports `complete_academy_lesson5` only as callable by authenticated users; it does **not** report anonymous execution for that function. The function enforces the user-scoped prerequisites internally.

## Verification log

Production route, mobile, private RLS, anonymous answer-key shape, founder-editor rendering, roadmap, and real-data persistence findings will be appended after deployment. No fabricated learner record may be used for these checks.

## Initial public mobile review

Fresh signed-out production captures at 320 px and 430 px load the Lesson 5 header, compact direct-action navigator, opening content, and progress rail without a visible horizontal overflow. At 320 px, the headline wraps cleanly and the three direct-action buttons remain contained. At 430 px, the same controls remain visible and the long ownership opening remains readable within the viewport.

The 360 px and 390 px signed-out production captures likewise keep all three direct actions inside the viewport. The labels wrap only where needed, the Lesson 5 heading remains readable, and no horizontal scroll or clipped content is visible in the opening layout.

The remaining 375 px and 412 px captures confirm the same outcome. Across all requested 320, 360, 375, 390, 412, and 430 px widths, the direct-action navigator, heading, opening copy, and lesson rail are readable and contained in the signed-out public production route.

## Public and founder-boundary review

A fresh signed-out browser rendered all eight published Lesson 5 Knowledge Check prompts at the direct quiz anchor. A read-only anonymous quiz RPC response contained eight prompts and no `answer_key` field. Non-writing anonymous requests to `complete_academy_lesson5` and the private ownership-map endpoint each returned HTTP 401.

In the confirmed database-role-gated founder session, the production Academy administration page rendered the Lesson 5 editor with the published title, summary, status, structured lesson configuration, public quiz configuration, founder-only answer key, passing score, and Save action. No field was edited or saved, and no private learner response was opened.

## Module roadmap review

The authenticated production Module 1 roadmap renders Lesson 5 as **Available** and links it to the published route. Lessons 1–4 remain accessible. Lessons 6 and 7 continue to display **Coming Soon** and remain non-clickable. The review did not open Lesson 5 or create any Lesson 5 learner progress.

## Real-data validation limitation

The user confirmed they cannot complete the private Lesson 5 map, quiz, and completion flow in the current browser session. No substitute learner response, quiz attempt, section progress, or completion record was created. The end-to-end authenticated persistence journey remains a voluntary real-user validation item; all public rendering, server-side prerequisite rules, RLS denial, founder access, and mobile presentation checks above are complete.
