# Supabase Provisioning Log

## Project access

The authorized Supabase dashboard session confirms access to project `dhawwokxkeurcmiemxbm`, linked to `main1973/7Tribes-site`. The project is healthy and currently shows no prior migrations.

## Static-hosting constraint

The existing 7trb.com repository is deployed as a GitHub Pages static site. The supplied URL and publishable key are therefore appropriate for a browser client; the Next.js SSR client and middleware examples are not applicable to the existing hosting model.

## Migration state

The first browser input action exceeded its automation timeout while populating the editor. The partial SQL was therefore discarded from the execution path and replaced through the SQL Editor's native Monaco model after complete migration-boundary checks. The confirmed migration was then submitted in the Supabase SQL Editor, which returned **Success. No rows returned**.

A follow-up read-only schema query verified all 13 Phase 1 tables: `academy_admin_audit_log`, `academy_capability_profiles`, `academy_capability_responses`, `academy_completions`, `academy_courses`, `academy_lesson_progress`, `academy_lesson_quizzes`, `academy_lessons`, `academy_modules`, `academy_profiles`, `academy_quiz_attempts`, `academy_scenario_responses`, and `academy_user_roles`.

## Auth redirect correction required

The authorized Supabase **Authentication → URL Configuration** page shows one incorrect allow-list entry: `http://7trb.com/academy` (HTTP, no trailing slash). The approved production return URL is `https://7trb.com/academy/`. A read-only form inspection also confirmed that the current default Site URL is `http://localhost:3000`. The user approved replacing these values with `https://7trb.com/academy/` and `https://7trb.com/`, respectively.

The Site URL form field has been updated in the authorized dashboard to `https://7trb.com/`. The change is staged in the form and will be saved together with the corrected Academy redirect allow-list entry.

The redirect allow-list dialog now contains the confirmed value `https://7trb.com/academy/`, staged for the authorized save operation.

The secure Academy redirect entry was saved successfully and now appears in the allow list alongside the prior HTTP entry. Opening the redirect dialog discarded the unsaved Site URL field change, so the Site URL remains `http://localhost:3000` and must be saved separately. The incorrect HTTP redirect entry is still present and requires removal after the secure default URL is saved.

The Site URL was re-entered as `https://7trb.com/` and the authorized **Save changes** action was submitted. The dashboard needs one final read-only refresh before this configuration is treated as persisted.

The final read-only refresh confirms the Site URL is now persisted as `https://7trb.com/` and the secure allow-list entry `https://7trb.com/academy/` is present. The obsolete `http://7trb.com/academy` entry remains and is the only redirect value scheduled for removal.

The obsolete HTTP entry was selected and the user-approved removal submission was sent. A final configuration refresh is required before recording the removal as persisted.

Final verification confirms the secure configuration is persisted: Site URL is `https://7trb.com/`; the only allowed Academy redirect is `https://7trb.com/academy/`; and the obsolete `http://7trb.com/academy` entry has been removed.

The authorized SQL Editor now contains the reviewed, idempotent Module 1 / Lesson 1 curriculum seed. It inserts only the published Life Academy course, How America Works module, Understand the System lesson, and its three-question quiz; it creates no learner, capability-profile, progress, response, or completion records.

The approved curriculum seed execution was submitted in the authorized SQL Editor. Database execution status will be confirmed before the curriculum is treated as published.

A public RLS-protected API check still returned no published course, module, or lesson records, so the initial SQL Editor run did not complete successfully. The SQL text remains staged in the authorized editor; an editor-shortcut retry also did not produce a result panel. The next step is to invoke the already-approved **Run** control directly and then repeat the public read-only API check.

The user provided explicit final confirmation for the non-learner curriculum seed and the SQL safety confirmation was submitted. The editor remains in its execution state without a visible result panel, so published-record verification will proceed through the public RLS-protected API rather than inferring success from the editor overlay.

The SQL safety prompt was confirmed to have one enabled **Run** control. It was invoked directly through the authorized dashboard after the user confirmation. The curriculum remains unverified until the public read-only API returns the expected published course, module, and lesson records.

The previously staged read-only Lesson 1 query was also invoked directly through the SQL Editor run control to distinguish a missing seed record from a public RLS visibility issue. Its result will be reconciled with the public API before any corrective seed action is considered.

Because the public course and module records were present but the published Lesson 1 record was not visible, a focused idempotent retry was staged for only the existing How America Works module, Lesson 1, and its quiz. It does not create learners or modify any private learner record. The authorized SQL Editor run action has been invoked; the final safety confirmation and public API result will determine success.

The focused retry safety prompt was confirmed through the authorized SQL Editor under the user’s prior curriculum-seed authorization. Final success is pending verification of the public lesson record.

The published Lesson 1 record is now visible through the public API, but its associated quiz prompts were not returned. A final idempotent, quiz-only retry is staged for the same approved three questions and answer key. It affects no learner or private data and remains covered by the user-approved curriculum seed scope.

The focused quiz-only retry completed successfully in the authorized SQL Editor with no rows returned, as expected for an upsert command. Public prompt retrieval will be rechecked before the static Lesson 1 client is treated as fully ready.

The public RPC response still requires reconciliation. A read-only authorized query for the quiz record's lesson relationship, prompt count, and passing score is staged in the SQL Editor; it intentionally does not select or expose the answer key.

The authorized query verified one quiz record for Lesson 1, with three prompts and a passing score of three. The answer key remains private in the database. The public prompt RPC is not currently returning a payload despite the verified record and will be addressed before the public Lesson 1 client relies on it.

A direct read-only SQL invocation of the prompt function is staged to verify its server-side result independently of the PostgREST RPC transport. It selects only the public prompt payload and does not expose the private answer key.

The direct function query returned all three approved public Lesson 1 prompts. The quiz seed is therefore present and private answer-key protection is intact. The earlier empty HTTP test was a transport/request-shape issue, not missing Academy curriculum data.

The Supabase authentication configuration now persists `https://7trb.com/` as the Site URL and `https://7trb.com/academy/` as the sole Academy redirect allow-list entry. The user-confirmed founder-controls migration is staged in the authorized SQL Editor and creates only founder-gated metric and recent-learner functions.

The founder-controls migration executed successfully with no rows returned. The database now includes role-gated founder metrics and recent-learner functions, both executable only by authenticated users and both returning records only when the caller has the `founder_admin` role.

Local static-route verification confirmed that `/academy/` renders the Academy landing with the Module 1 roadmap and secure sign-in entry, while `/academy/lesson-1.html` renders the reusable Lesson 1 flow, scenario, private capability exercise, three-question knowledge check, and authenticated completion gate. Both routes retain their official branding and contained responsive layout.
