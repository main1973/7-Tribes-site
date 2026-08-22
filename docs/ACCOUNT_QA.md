# 7Tribes Account QA Record

## Local static verification

The password-based Account pages were served from the existing static-site tree and inspected without creating any production or QA user accounts. At the 320 px signup viewport, the branded Account header, introduction, and form remain within the viewport with readable text and no visible horizontal overflow. At the 390 px unauthenticated My Account route, the private route redirected to the password login form and displayed no email, progress, role, or other private account data.

At the 412 px password-recovery viewport, both password fields and the reset action remained fully contained with no clipping. At the 430 px Academy entry viewport, the former magic-link form was replaced by Create Account and Log In actions that return to `/academy/`; their styles are intentionally differentiated to make the standard Account choice clear on a narrow screen.

The public Lesson 1 route was opened in a signed-out state and its private-response submission was exercised without any response data or account creation. The action stayed on the public lesson route and did not record private learner data. It rendered the approved message, “Save your progress Create a free 7Tribes account to continue your Life Academy journey and return where you left off,” with Create Account and Log In links that both preserve `/academy/lesson-1#capability` as `returnTo`.

The gate’s rendered HTML includes the correctly encoded `returnTo` parameter. The first local server normalized `.html` routes to clean URLs and discarded query strings during its redirect, so it is not suitable to certify query preservation; a plain static-server check is required before release. This behavior is local-server-specific and has not been treated as GitHub Pages behavior.

The plain static-server verification succeeded: `/account/signup.html?returnTo=%2Facademy%2Flesson-1%23capability` remained intact in the browser, and the client read `returnTo` as `/academy/lesson-1#capability`. This confirms that the Account route and safe return flow retain the intended Academy position under normal static-file serving.

The signup page accepted deliberately mismatched non-production values solely to test client-side behavior; no account request was sent. The browser’s required Terms and Privacy checkbox correctly blocked the submission before client registration logic. The mismatch branch remains to be exercised only after accepting the checkbox; no actual signup will be performed.

After the required consent control was selected, the deliberately mismatched passwords produced the expected “Your passwords do not match.” message. This completed a client-only validation test without invoking `auth.signUp`, creating an Auth user, creating an Academy profile, or writing any learner data.

On the shared homepage navigation, the session-aware drawer opened successfully and injected exactly the signed-out Account actions: `Log In` linking to `/account/login.html` and `Create Account` linking to `/account/signup.html`. No private account data was included in the signed-out drawer.

Read-only anonymous API checks returned an empty array for `academy_profiles`, an empty array for `academy_lesson_quizzes`, and `null` for `get_7tribes_account_overview()`. These checks confirm that the public browser configuration does not disclose profile rows, quiz-key rows, or private account-overview values without an authenticated session.

The 360 px Login page preserved a contained, readable password form and visible Life Academy/Create Account paths. The final 430 px Academy entry review confirmed that the Create Account action is visually prominent, the Log In action is distinctly outlined, text remains readable, and the layout does not show horizontal overflow.

All nine release routes returned HTTP 200 from the plain static server: the five Account routes, both Academy public routes, and the Academy administration route. Authenticated behavior for My Account, settings, and Academy administration remains intentionally server-gated and was not tested with an unapproved or fabricated user account.

## Production verification

GitHub Pages workflow `32592318406` completed successfully for commit `618f7f8`. Live `https://7trb.com/account/signup.html` renders the branded Account signup form. Live `https://7trb.com/account/` redirects signed-out access to `https://7trb.com/account/login.html?returnTo=%2Faccount%2F` and does not disclose private account information.

Live `https://7trb.com/academy/lesson-1.html#capability` displays the approved Account gate after a signed-out private-response action. Both action links preserve `/academy/lesson-1.html#capability` through their encoded `returnTo` values, and no learner response was submitted.

The live shared drawer opened successfully and supplied the signed-out Account actions `Log In` and `Create Account`, with their intended `/account/login.html` and `/account/signup.html` destinations. The account-navigation cache revision is therefore active in production.

Live HTTP checks returned 200 for all nine release routes: five Account pages, the Account root and settings routes, the Academy public routes, and the Academy administration route. Authentication-specific actions that require a real user session—successful password login, email confirmation receipt, password-reset email receipt, private Account rendering, and founder-console data—were not executed with a fabricated account or an unapproved founder session. Email provider and confirmation policy were verified in the authorized dashboard, but sender-domain deliverability remains an operational configuration item rather than a claimed test result.

After final deployment, the existing browser session was verified as signed out. No private account record, founder role, Academy progress, or user email was read during this check. Authenticated production validation therefore remains blocked pending explicit founder-session authorization or a user-completed login.

During password-login investigation, the browser showed another signup attempt against the already established Account rather than a successful password-login session. Supabase returned the deliberately generic confirmation-success response used to avoid account enumeration; it does not establish, replace, or change the existing account password. The secure resolution is the already-delivered password-recovery link, followed by login—not another signup submission. No entered credential was retained in this record.

The founder Account has since been verified as present, confirmed, and linked to its private Academy profile and database-controlled founder role. The client sends password-recovery links to `/account/reset-password.html`, and the exact HTTPS route is present in Supabase’s redirect allow-list. The authenticated mailbox search also located the delivered 7Tribes password-recovery message in Inbox. The remaining user action is to open that message’s reset link, choose a password, and then use Log In; another Create Account submission intentionally cannot replace the existing password.

A direct Gmail search for the verified `no-reply@7trb.com` sender surfaced the password-recovery conversation in the authenticated mailbox. The message is neither absent from the mailbox nor in Spam; the remaining step is to open the matching conversation and select its reset link.

The dashboard-generated message was found to use the site-root fallback target. The live public Account recovery form was opened with the existing confirmed account email; its browser client explicitly requests the deployed `/account/reset-password.html` recovery route. The form is prepared for one replacement recovery request through the verified SMTP sender.

The Account recovery form accepted the request and Gmail immediately displayed a new unread 7Tribes recovery message in Inbox. The next check is limited to verifying the message’s non-secret redirect destination before the user opens the reset action.

The latest Account-initiated recovery link was inspected with token exclusion. Its only recorded redirect destination is `https://7trb.com/account/reset-password.html`, confirming that the public Account recovery form avoids the dashboard-send site-root fallback and hands recovery to the deployed reset page.

The user completed the Account-initiated password reset and successfully authenticated on the live production login route. The signed-in My Account page rendered the private account summary, Academy progress zero state, Capability Profile status, settings entry, and the founder-only Academy administration link. The Academy administration route loaded under the database-controlled founder role. Secure logout returned the browser to `https://7trb.com/`, and a subsequent direct `/account/` request redirected to password login, confirming that private Account content is not accessible after logout. No learner progress, quiz attempt, capability response, completion, profile value, or role value was changed during this validation.

The remaining local checks cover the login, reset, Academy entry, and signed-out Academy persistence gates at the requested phone widths, followed by desktop and production verification after deployment.

The corrected Academy landing roadmap was visually reviewed at 320 px and 430 px. The retained header, hero, Account actions, Module 1 heading, seven-lesson badge, and approved Module 1 description remain contained without observed horizontal overflow. The single-column mobile system remains intact; a full list and desktop review follows before deployment.

Extended 430 px and 1280 px views confirmed the entire Module 1 list renders exactly seven rows. Lesson 1 is the only linked, available lesson; Lessons 2–7 remain visibly disabled and marked Coming Soon, with no curriculum copy exposed. The existing responsive header, Account cards, spacing, and button behavior remain unchanged and no horizontal overflow was observed.

The final production-database verification confirms the learner-facing roadmap aligns with the stored hierarchy: one Module 1, seven lessons, the approved Module 1 description, the renamed published Lesson 1, and six empty Coming Soon records. The signed-out roadmap uses the public Available state; authenticated learner status is derived only from the owner’s RLS-protected progress and completion rows.

The existing Lesson 1 static page was then aligned to the same approved label in its browser document title and visible heading. The lesson’s body, scenario, capability exercise, quiz, completion gate, authentication checks, and responsive CSS were not changed.

After the final GitHub Pages deployment, the live Academy roadmap was inspected at 390 px using a cache-busting production request. It displays Module 1, the approved description, and exactly seven contained lesson rows; Lesson 1 is available and Lessons 2–7 are disabled Coming Soon. The final live Lesson 1 request confirms the visible heading and document title use “Who Actually Runs What?”.
