# 7Tribes Life Academy — Phase 1 Backend Architecture

## Hosting-compatible approach

The existing 7trb.com deployment is a GitHub Pages static site with custom domain `7trb.com`. It does not run Next.js, server-side rendering, middleware, or runtime environment-variable injection. The supplied Next.js server and middleware helpers are therefore intentionally not used. Instead, the Academy will load the official Supabase browser client from a pinned CDN build and use the project URL plus **publishable** key in a static client configuration file. Publishable Supabase keys are designed for browser use; private authorization is enforced in Postgres with RLS rather than by hiding a public client key.[1]

## Authentication flow

Academy users will sign in through Supabase Auth with email magic links. The static Academy client sends an OTP link to the user’s email with the Academy route as `emailRedirectTo`. When the user returns, the Supabase browser client restores the authenticated session. Browser session storage supports authentication only; it is not the source of truth for learner progress, private responses, completion records, capability profiles, or roles.

The Supabase project must allow `https://7trb.com/academy/` as an authentication redirect URL before production rollout. Local testing may additionally allow the explicit local Academy URL. Founder access is assigned only inside the database after a founder account exists; no browser-side flag or URL grants founder privileges.

## Data model

| Group | Tables | Purpose |
|---|---|---|
| Identity and authorization | `academy_profiles`, `academy_user_roles` | Learner display name and server-enforced learner/founder role. |
| Reusable curriculum | `academy_courses`, `academy_modules`, `academy_lessons`, `academy_lesson_quizzes` | Published and future curriculum. Quiz answer keys remain private. |
| Private learner work | `academy_lesson_progress`, `academy_scenario_responses`, `academy_quiz_attempts`, `academy_capability_profiles`, `academy_capability_responses`, `academy_completions` | Real learner activity, progress, capability data, and completion records. |
| Governance | `academy_admin_audit_log` | Founder administrative actions. |

## Security and RLS model

Every private Academy table has RLS enabled. Learners can select and mutate only rows whose `user_id` matches `auth.uid()`. Founders can manage curriculum and view learner records only through the server-side `is_academy_founder()` role check. Learners receive quiz prompts through `get_academy_lesson_quiz`, while answer keys remain unavailable to browser reads. Lesson completion is granted by `complete_academy_lesson` only after a stored passed quiz and a submitted capability exercise exist.[2]

## Founder administration

Founder status is not inferred from a website account, wallet, email domain, or client value. The first founder must create a Supabase Auth account; an authorized database administrator then changes only that account’s `academy_user_roles.role` to `founder_admin`. Founder controls will use the same static Academy application and the same Supabase project, preventing a disconnected administrator system.

## Deployment changes

The Academy will add static routes under `/academy/`, a shared Academy browser-client module, and a Supabase migration under `supabase/migrations/`. No existing 7trb.com route, Loop, Connect, or mobile application code requires migration. The service worker cache version will be updated at publication so Academy routes and scripts are not held on stale static assets.

## References

[1]: [Supabase JavaScript client and API-key guidance](https://supabase.com/docs/reference/javascript/introduction)

[2]: [Supabase Row Level Security guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
