# 7Tribes Account Architecture

## Purpose

**7Tribes Account** is the single authenticated identity layer for 7trb.com, Life Academy, and future first-party 7Tribes services. It is not a Loop account, Connect account, wallet, Nuru identity, payment flow, or cryptocurrency requirement.

The existing site remains a GitHub Pages static deployment. Browser pages use Supabase Auth and the public Supabase browser client. Private data is protected by database policies, not by hiding a browser key or relying on local storage.[1]

## Account flows

| Route | Purpose | Authentication behavior |
|---|---|---|
| `/account/signup.html` | Create a 7Tribes Account with email, password, display name, and required terms/privacy acceptance. | Uses `auth.signUp`; email confirmation follows the Supabase provider setting. |
| `/account/login.html` | Password login and return-to-origin support. | Uses `auth.signInWithPassword`; the Supabase session is authoritative. |
| `/account/forgot-password.html` | Request a secure reset email. | Uses `auth.resetPasswordForEmail`. |
| `/account/reset-password.html` | Set a new password after the reset link establishes a recovery session. | Uses `auth.updateUser`. |
| `/account/` | Private My Account view. | Uses a role-gated account overview RPC and private RLS data only. |

## Data and access model

`academy_profiles` stores display name and terms/privacy acceptance metadata. `academy_user_roles` is the only role authority. New accounts start as `member`; pre-existing Academy accounts can retain their earlier `learner` role. Privileged `admin` and `founder_admin` roles can be assigned only through the existing security-definer database function after its database-side founder/admin check passes. The browser never supplies a role or treats a route or client flag as role authority.

Academy progress, quiz attempts, scenario responses, completion records, capability responses, and capability profiles retain their existing RLS policies. A logged-in account can access only records whose `user_id = auth.uid()`; founder/admin access requires the database role check. Anonymous users can read published curriculum only. Quiz answer keys remain unreadable to browser clients.[2]

## Redirect and email settings

The production Site URL is `https://7trb.com/`. The redirect allow-list must include all of the following static routes:

| Required redirect | Used by |
|---|---|
| `https://7trb.com/academy/` | Academy learning entry and authenticated learner return |
| `https://7trb.com/account/login.html` | Email confirmation return |
| `https://7trb.com/account/reset-password.html` | Password recovery return |

The Supabase Email provider must remain enabled. If email confirmation is enabled, account creation correctly reports that a verification email is required. Password-reset links must come from Supabase Auth and are not returned in a browser response or repository file.[3]

## Founder bootstrap

After the intended founder creates an account, an authorized database administrator assigns `founder_admin` directly in `academy_user_roles`. The designated email is not trusted by browser code, and an account cannot grant itself any privileged role.

## References

[1]: [Supabase JavaScript Auth reference](https://supabase.com/docs/reference/javascript/auth-signup)

[2]: [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[3]: [Supabase password-based authentication](https://supabase.com/docs/guides/auth/passwords)
