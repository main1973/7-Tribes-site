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

The deployed Academy landing page at `https://7trb.com/academy/` loads successfully after the Phase 1 release. Its browser console reported no client, Supabase, or navigation errors in the public signed-out state.

The deployed Lesson 1 route renders the approved public lesson content, private capability fields, knowledge check, and completion gate. The signed-out private-response action was exercised without any learner session; no learner record or local-progress substitute was created.

A read-only authorized lookup for the founder-designated Academy email was submitted in the Supabase SQL Editor. No role assignment has been attempted or made pending confirmation that the authentication account exists.

The initial lookup returned no account. After the designated founder reported completing the Academy magic-link sign-in, a second read-only lookup was submitted. Founder-role assignment remains pending confirmation of that account record and an explicit database-change confirmation.

The combined 7Tribes Account migration exposed PostgreSQL’s enum-transaction rule: newly added enum values cannot be referenced by dependent functions within the same transaction. The migration was split into a role-enum step and a dependent account-auth step; the first transaction-safe role-enum step has been submitted under the user-approved database change.

The separate role-enum transaction succeeded. The dependent profile-metadata, default-member-role, founder-check, and private account-overview migration has now been submitted as a separate authorized transaction.

The dependent account-auth migration succeeded. The user-confirmed update assigning the verified founder account the `founder_admin` database role returned exactly one resulting role: `founder_admin`. No other account role was changed.

Supabase Auth URL Configuration was verified after the Account rollout. The Site URL remains `https://7trb.com/`. The approved redirect allow-list now contains three entries: `https://7trb.com/academy/`, `https://7trb.com/account/login.html`, and `https://7trb.com/account/reset-password.html`. The dashboard confirmed that two Account URLs were added successfully.

Read-only provider inspection confirms that new user signups are enabled, Email authentication is enabled, and email confirmation is enabled. Manual linking and anonymous sign-ins remain disabled. No confirmation or email-delivery policy was changed; the Account UI must retain its confirmation-aware success state and email delivery should not be claimed until a configured sender is verified.

A read-only SQL inspection confirms that `on_auth_user_created_academy` remains active as an `AFTER INSERT` trigger on `auth.users` and invokes `handle_new_academy_user()`. Therefore, new password signups receive their private profile and database-controlled default `member` role through the trigger rather than through browser-side insertion.

Following a live confirmation-email delivery report, a read-only Auth → Emails inspection confirmed that Supabase is using its default templates and that custom SMTP has not been configured. The dashboard requires custom SMTP before the project can edit templates or use a verified custom sender. No sender, template, confirmation, or rate-limit setting was changed during this inspection.

The dedicated Auth SMTP page confirms that custom SMTP is disabled. The Auth Rate Limits page exposes the project email-per-hour control alongside token, verification, and sign-in limits. Its exact configured email value is being inspected separately; no limits or IP-forwarding behavior were changed.

The read-only rate-limit form reports `RATE_LIMIT_EMAIL_SENT = 2`. This matches the current Supabase documentation: built-in SMTP is restricted to two combined Auth emails per hour, may send only to pre-authorized project-team addresses, has no delivery SLA, and cannot have its email rate raised without custom SMTP. The same documentation explicitly advises retaining confirmation-email protection and using a custom SMTP sender for production delivery. Authoritative references: https://supabase.com/docs/guides/auth/auth-smtp, https://supabase.com/docs/guides/auth/rate-limits, and https://supabase.com/docs/guides/troubleshooting/not-receiving-auth-emails-from-the-supabase-project-OFSNzw.

The project Auth Logs view currently shows no rows and warns that data may take up to 24 hours to refresh, so it cannot attribute the specific confirmation request to a delivery error in real time. The documented production remedy remains custom SMTP with a verified sender; no available log evidence supports changing confirmation policy or making any other Auth setting change.

The user supplied a Resend API-key CSV for remediation. Each listed credential was tested only against Resend’s domain-list endpoint with no secret output or configuration mutation. Every supplied key returned HTTP 400 with `API key is invalid`, so no verified sending domain or SMTP configuration could be retrieved. The credentials were not copied into the repository, browser, project settings, or documentation.

The user then authenticated in the Resend dashboard. Its Domains view confirms that `7trb.com` is verified and can serve as the sending domain for the proposed production Auth sender. No Resend API key or Supabase SMTP setting has yet been created or changed.

The user supplied a replacement Resend credential for the approved SMTP configuration. It was validated without outputting its value: the Resend domains endpoint returned HTTP 200 and reported `7trb.com` as verified. The credential remains only in a temporary, non-repository file pending entry into Supabase’s encrypted SMTP setting.

With explicit user approval, the Supabase SMTP form was prepared for a single save using sender `no-reply@7trb.com`, sender name `7Tribes`, host `smtp.resend.com`, port 465, username `resend`, and the validated Resend credential. The credential value is omitted from this record. Email confirmation remains enabled; the production save is the next pending action.

The initial dashboard save control was invoked, but the SMTP form remained visible after the request with its entered non-secret values. Persistence is being checked before any authentication email is retried; no interpretation is made from the masked password field alone.

The form’s save control was confirmed enabled and invoked a second time. No success or error toast was exposed by the dashboard, so the settings will be reloaded independently to distinguish a persisted configuration from unsaved in-page state.

The dashboard was navigated away from and back to the SMTP settings page for an independent persistence check. Its initial loading state again presents the Custom SMTP control; a completed render check is required before recording a final saved-or-unsaved conclusion.

The independent reload confirms custom SMTP is enabled and the non-secret configuration persists as `no-reply@7trb.com` / `7Tribes` / `smtp.resend.com` / port 465 / username `resend`. The password field is blank on reload, as expected for a stored encrypted secret. The temporary credential files were deleted immediately after persistence verification. The authorized founder account is present in Auth Users; no private profile, role, progress, or password value was read from the user list.

The existing founder Auth record was inspected in the authorized dashboard to determine whether a confirmation resend was necessary. Its account email is already confirmed, so no additional confirmation email was sent. This explains why a new confirmation message is not a valid prerequisite for password login on that established account. A password-recovery send remains available if the user wants an explicit delivery test through the new verified SMTP sender; it does not change a password unless the recipient follows the recovery flow.

At the user’s explicit request, one password-recovery email was sent to the already confirmed founder account. The Supabase dashboard reported that the recovery link is valid for 60 minutes, and the authenticated Resend dashboard independently reported the corresponding “Reset your password” message as **Delivered**. This verifies production handoff and delivery through the newly configured sender without changing the account password.

To investigate the reported missing profile, a single read-only SQL query was prepared in the authorized editor. It checks only whether the founder Auth row and `academy_profiles` row exist and returns the database role label; it does not select email, password, progress, capability, or other profile data.

The first read-only execution failed safely because the profile table uses `id` rather than `user_id`. The query was corrected using the repository schema definition; it remains existence-only and does not mutate any database row.

The corrected query returned one row confirming: the founder Auth account exists, the matching `academy_profiles` row exists, and the database role is `founder_admin`. Therefore, no profile-creation repair or role reassignment is required. The reported profile symptom is an unauthenticated client-access issue, not an absent profile record.

The authorized URL configuration was rechecked against the deployed account client. The site URL is `https://7trb.com/`, and the exact deployed password-recovery return route `https://7trb.com/account/reset-password.html` is already present in the allow-list alongside the Account login and Academy routes. No redirect configuration mismatch or change was found.

The delivered recovery message generated from the Supabase dashboard was inspected without retaining its one-time token. Its redirect target falls back to the project Site URL (`https://7trb.com/`) rather than the deployed Account reset route. This is a dashboard-send limitation rather than an allow-list error. The public 7Tribes Account recovery form already supplies the explicit `/account/reset-password.html` target and must be used for the next recovery email.

The Account-initiated recovery request delivered a fresh email whose non-secret redirect target was verified as `https://7trb.com/account/reset-password.html`. The user completed the reset, authenticated successfully through the live password-login page, accessed the private Account and database-role-gated Academy administration views, and completed secure logout. No role, private profile field, learner response, progress, quiz, or completion record was changed in this validation.

For the approved Academy V1 hierarchy correction, a read-only curriculum inventory has been prepared in the authorized SQL editor. It returns course/module/lesson identifiers, publication status, positions, and only aggregate learner-data dependency counts for each lesson. It does not select learner identities, response contents, or private profile fields and performs no database mutation.

The first inventory execution stopped with a PostgreSQL missing-alias error before returning data or changing any record. The query is being corrected to use explicit table names for this editor; its scope remains read-only and aggregate-only.

The SQL editor retained part of the first text during an accessibility-control replacement attempt, so the second execution again returned the original alias error before any database action. A new blank query tab will be used rather than editing the retained text in place; the next query remains read-only.

Before the fresh blank query could be used, the Supabase dashboard session expired. No curriculum inventory data was returned and no module, lesson, progress, completion, or other Academy record was changed. Database correction is paused pending renewed authorized dashboard access.

Authorized dashboard access was restored through the user’s browser connection. The fresh editor remains blank, but the browser’s long-text input operation timed out before submitting the concise inventory. No SQL ran and no Academy database record was changed; an alternate editor-entry method is being used.

The concise aggregate-only inventory is now present in the active SQL editor. A stale element index navigated to the dashboard Logs view instead of the Run control, but the query remains visible in the docked SQL editor and has not executed. No curriculum or learner-data record changed during this navigation detour.

The aggregate-only inventory was then executed from the docked SQL editor and returned one curriculum row; it did not mutate data. Dashboard request logs also show existing Lesson 1 progress writes for the published Lesson 1 slug, confirming that legitimate progress exists and must be preserved. The returned row is being extracted before any curriculum correction is chosen.

The returned curriculum row confirms exactly one published module, `how-america-works` / **How America Works**, containing the existing published Lesson 1 record `understand-the-system`. No placeholder Module 2+ record exists in the database, so no module deletion or migration is required. Existing Lesson 1 progress is preserved. The database correction is limited to updating the Module 1 summary and adding six unpopulated `coming_soon` lesson records under that existing module.

The first execution attempt of the approved migration failed before mutation because the dashboard editor concatenated the prior read-only query after the migration text, producing an invalid relation reference. The active editor uses Monaco and exposes a direct full-document model replacement path; the migration will be reinserted as a clean standalone statement before rerun. No curriculum or learner-data change occurred in the failed attempt.

The clean standalone Module 1 migration completed successfully. It updated the existing Module 1 summary and inserted six empty `coming_soon` lesson records at positions 2–7. The existing published Lesson 1 record was not updated or deleted, no unapproved Module 2+ database record was removed because none existed, and the migration did not touch learner progress, responses, quiz attempts, capability data, completions, profiles, roles, or authentication records.

After the local visual review, the browser context returned to a fresh authorized SQL editor tab. The final database verification will use a new read-only query rather than modifying the completed migration query.

The final verification confirmed seven Module 1 lesson records and the approved Module 1 summary. It also exposed that the retained published Lesson 1 database title was still “Understand the System” even though the learner-facing roadmap correctly uses “Who Actually Runs What?”. A single-row metadata update was prepared but the dashboard browser session expired before it could run. No learner data changed while access was unavailable.

After renewed authorized access, the one-row Lesson 1 title update completed successfully. The final read-only query returns exactly seven Module 1 rows: Lesson 1 is published at position 1 with the approved title **Who Actually Runs What?** and non-empty existing lesson content; Lessons 2–7 occupy positions 2–7, each has `coming_soon` status, and each has empty lesson content. The Module 1 summary matches the approved wording. No Module 2+ record was removed because no such database record existed, and the title-only update did not change the existing Lesson 1 slug, content, learner progress, responses, quiz attempts, completions, capability data, profile, role, or authentication data.

The static Lesson 1 page title and visible heading were updated to match the corrected database and roadmap label. No lesson body, learner-facing exercise, quiz, completion logic, auth behavior, or private data was changed.

The linked GitHub Pages deployments completed successfully. Cache-busting live checks confirm that the Academy roadmap presents one Module 1 with the approved summary and seven lesson rows, while the live Lesson 1 document title and visible heading use “Who Actually Runs What?”.

The approved Lesson 2 migration `20260822230000_life_academy_lesson2_follow_the_money.sql` was applied through the authorized Supabase migration connection. It created the private `academy_lesson_exercise_responses` table with owner-or-founder RLS, authenticated Lesson 2 section-progress and completion RPCs, and answer-feedback support in the existing quiz RPC. It published the existing Lesson 2 record without creating any learner, response, progress, quiz-attempt, or completion data.

A read-only post-migration inventory confirms `follow-the-money` is published at Module 1 position 2 with 22 estimated minutes, 11 structured sections, 8 quiz questions, a passing score of 6, and the private exercise table present. No Module 2 record, Lesson 3 publication, or learner data was created.

Read-only anonymous API checks confirm the published Lesson 2 record is publicly readable while `academy_lesson_exercise_responses` and owner-bound `academy_lesson_progress` return no records anonymously. The signed-out Lesson 2 private supply-chain and $100 Journey actions render the standard Account gate with the appropriate section return anchor and create no private data.

The post-migration security advisor revealed that Academy private SECURITY DEFINER RPCs were still executable by the anonymous role, despite internal authentication checks. The follow-up migration `20260822231000_restrict_academy_private_rpc_execution.sql` revoked anonymous execution from private completion, section-tracking, quiz-submission, account-overview, founder, role, and trigger functions while retaining authenticated grants. A read-only privilege query now verifies `anon_execute = false` and `authenticated_execute = true` for `complete_academy_lesson2`, `track_academy_lesson_section`, `submit_academy_quiz`, and the Account overview. `get_academy_lesson_quiz` remains intentionally public because it returns published prompts and choices only, never answer keys.

The helper revocation temporarily prevented anonymous published-curriculum reads because the existing RLS policies reference the null-safe `is_academy_founder()` helper alongside `status = 'published'`. Migration `20260822231500_restore_public_curriculum_read_helper.sql` restores anonymous execution for that helper only. The helper returns `false` without an authenticated user and exposes no profile, role, lesson-answer, or learner data. Published Lesson 2 content and public quiz prompts load again, while the private completion, section-tracking, quiz-submission, and Account-overview RPCs remain anonymous-denied.

The approved Lesson 3 migration `20260822232000_life_academy_lesson3_how_work_actually_works.sql` was applied through the authorized migration connection. It published the existing position-3 Lesson 3 record, stored eight structured lesson sections, seeded a five-question Knowledge Check with a four-answer passing score, and added a server-validated completion RPC for the private Labor to Capability challenge. No learner, progress, response, quiz-attempt, completion, profile, role, or authentication record was created.

A read-only post-migration inventory confirms `how-work-actually-works` is published in Module 1 at position 3 with 24 estimated minutes, 8 sections, 5 public quiz prompts, and a 4-answer passing score. Lessons 1–2 were not changed and Lesson 4 remains outside this migration.

The designated founder account’s database role was confirmed through a minimal read-only query as `founder_admin`. The prior static-browser helper made an unscoped role-table `maybeSingle()` request and received `PGRST116` when multiple visible rows existed, incorrectly falling back to `member`. The deployed helper now obtains the authenticated session and queries `academy_user_roles` by `user_id = session.user.id`; it uses no browser role override, URL parameter, or client storage. In the confirmed founder session, the production administration route returned `founder_admin` and visibly rendered the protected Lesson 3 content-editor fields. No content was saved, no learner data was read, and no role or database record was changed during this verification.
