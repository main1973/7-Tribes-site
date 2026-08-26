# Lesson 7 — How Communities Build: QA Record

## Scope

This final Module 1 capstone publishes public systems learning, a non-persistent educational Community Project Planner, an authenticated private Community Build Plan, a protected ten-question Knowledge Check, Lesson 7 completion, and a guarded Module 1 completion badge. It preserves Lessons 1–6 and creates no learner records through curriculum deployment or QA.

## Security contract

Public learning and the educational planner are available without authentication. The planner does not save inputs, create proposals, publish to Loop, expose data through Connect, or generate ecosystem statistics. The private Community Build Plan, section progress, quiz attempts, Lesson 7 completion, Module 1 completion, and module summary require an authenticated session and are RLS-backed. The Lesson 7 answer key is never public.

Module 1 completion is server-validated only after all seven published Module 1 lesson completions exist for the authenticated user. The completion badge is expressly a platform completion badge, not an accredited credential, license, government certification, college credit, or professional certification.

## Pending production checks

Production QA will record public-route behavior, anonymous read/write boundaries, module-RPC boundaries, founder-only Lesson 7 editor rendering, roadmap state, mobile widths, and any genuine-user persistence limitation without retaining private plan content.
