# 7Tribes Account Completion Report

**Release scope:** Secure Account authentication and Life Academy persistence foundation on the existing static GitHub Pages site. The work preserves Loop, Connect, Nuru, the mobile app, unrelated site pages, and Academy curriculum scope.

## Production result

The password-based 7Tribes Account flow is deployed on `https://7trb.com`. The existing founder account has been reset through the production recovery flow, has successfully signed in, rendered the authenticated My Account view, accessed the database-role-gated Academy administration view, and securely signed out. No fake user, learner progress, quiz attempt, completion, capability response, or role record was created to obtain this result.

| Area | Verified production behavior |
|---|---|
| Account creation | Branded signup requires email, password confirmation, display name, and Terms/Privacy acceptance. Existing-account wording now directs prior users to password recovery rather than implying duplicate signup replaces a password. |
| Password sign-in | The existing founder completed a password reset and successfully signed in through the live Account login route. |
| Password recovery | Custom SMTP sends from verified `no-reply@7trb.com`. The public recovery form generated a link whose redirect destination was verified as `/account/reset-password.html`. |
| Private My Account | Authenticated view displays the owner’s private email only inside the owner’s session, progress zero state, capability status, settings entry, and Academy links. |
| Founder access | The authenticated founder received the Academy administration link and loaded the founder controls via the database-controlled `founder_admin` role. |
| Logout | Logout returned to the site root; a direct subsequent `/account/` request redirected to login. |

## Routes and browser modules

| Route or module | Purpose |
|---|---|
| `/account/signup.html` | Password signup with display-name and consent metadata; clearly redirects returning users to recovery. |
| `/account/login.html` | Password login with safe same-origin return handling. |
| `/account/forgot-password.html` | Account-initiated password-recovery email request using the precise reset route. |
| `/account/reset-password.html` | Recovery-session password update. |
| `/account/` | Authenticated private account overview via `get_7tribes_account_overview()`. |
| `/account/settings.html` | Authenticated private display-name update. |
| `/academy/` and `/academy/lesson-1.html` | Public learning remains open; persistence actions require a 7Tribes Account and retain the return location. |
| `js/account-app.js` | Auth flows, safe return paths, private account rendering, settings, and logout. |
| `js/account-nav.js` | Session-aware mobile drawer account links. |

## Auth and delivery configuration

Supabase Site URL remains `https://7trb.com/`. The redirect allow-list includes the Academy route, `https://7trb.com/account/login.html`, and `https://7trb.com/account/reset-password.html`. Email/password authentication and email confirmation remain enabled.

Custom SMTP is enabled with the verified `7trb.com` sender domain, sender name **7Tribes**, host `smtp.resend.com`, port 465, and encrypted SMTP credential storage in Supabase. The initial dashboard-issued recovery email used the Site URL fallback, so the validated production flow uses the public Account recovery form, which explicitly supplies the reset-password route. The credential was never committed, logged, or retained after configuration.

## Database, RLS, and role model

The existing Supabase schema remains the private-data authority. `academy_profiles` uses the Auth user ID as its primary key, while `academy_user_roles` holds the database-controlled role. The active `on_auth_user_created_academy` trigger invokes `handle_new_academy_user()` to create a profile and default role for new Account registrations.

The confirmed founder has a present profile and the `founder_admin` role. The browser does not grant roles, and the Academy administration view is gated by database logic. Existing RLS policies keep profiles, progress, scenario responses, quiz attempts, capability records, and completions limited to the owner or authorized founder logic. Anonymous checks confirmed private profile and quiz-key data are not publicly available.

## QA performed

The public Account routes, signed-out My Account redirect, password-recovery UI, Academy persistence gate and return anchor, shared mobile Account navigation, live static routes, responsive Account layouts, RLS reads, and password-mismatch client validation were tested without creating a test account. Mobile visual checks covered the Account and Academy routes at 320 px, 360 px, 390 px, 412 px, and 430 px widths, with no observed horizontal overflow.

Authenticated production validation used only the user-authorized founder account. It verified the recovered password sign-in, private Account overview, founder administration entry, and logout. The account’s profile, role, progress, capability data, quiz data, and completions were not modified.

## Remaining operational guidance

The current verified sender is operational. Future administrative recovery sends from the Supabase dashboard will use the Site URL fallback unless that dashboard flow exposes a redirect override; use the public `/account/forgot-password.html` route when the Account reset screen is required. Keep the Resend API credential restricted, rotate it through the provider when appropriate, and never place SMTP or API secrets in the repository, static JavaScript, or browser-visible configuration.

The user may optionally add a private display name through Account Settings. No additional Academy lesson, Loop, Connect, mobile-app, blockchain, wallet, or payment work is included in this release.
