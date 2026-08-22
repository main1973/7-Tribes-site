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

The remaining local checks cover the login, reset, Academy entry, and signed-out Academy persistence gates at the requested phone widths, followed by desktop and production verification after deployment.
