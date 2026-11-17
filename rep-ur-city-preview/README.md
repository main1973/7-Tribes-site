# Rep Ur City — isolated Detroit preview

**Branch:** `feat/rep-ur-city-isolated-staging-preview-20261116`

**Purpose:** Prepare the Rep Ur City Detroit pilot for eventual testing on `staging.7trb.com` without changing 7trb.com, Loop, Connect, their existing Manus projects, data, or DNS.

## What has actually been built

A responsive, dependency-free, keyboard-accessible static preview in this directory:
- `index.html` + `styles.css` + `app.mjs`
- `game-rules.mjs`: pure, testable sample CP calculations and team totals
- `game-rules.test.mjs`: test data and no-ledger assertions

The score lab accepts a **manual East/West team selection**, one sample multiplier, and 100 hypothetical base CP. Users can simulate actions and reset this session's totals. All values start at zero and exist **only in browser memory**; nothing is uploaded, stored, or credited to any wallet.

**Not implemented:** accounts, Connect merchant sync, receipt uploads, proof verification, CP ledger, ZIP mapping, Nuru authentication, real 7TRB, Stripe, leaderboards with real users, payouts or awards. The preview must never be described as any of those features being live.

## Hosting safety gate (must be satisfied before publication)

Original deployment records identify `staging.7trb.com` as **an existing protected Manus staging project** (resource `wdp_00ff7fb070bde2ed4ee33604`, app `bejJD8cgUjAHVNWTqrQd7S`, historical DNS `staging → cname.manus.space`). Actual current live state and a restorable backup remain unverified. **Do not merge this separate GitHub main-site PR or overwrite the existing staging project.** Use `MANUS_STAGING_HANDOFF.md` for the non-destructive additive-route plan. Before publishing:
1. Identify the actual provider, project, current branch, domain mapping, database, and deployment source for `staging.7trb.com`.
2. Record a restorable backup/snapshot of its existing state and confirm ownership. Never overwrite original test or live data.
3. If staging is already occupied, use a namespaced path or an isolated alternate preview first; never overwrite it by assumption.
4. Publish only this static preview as a **separate** staging candidate. Verify it in Chrome and Nuru Android browser.
5. Ensure no production credentials, wallet keys, payment secrets, personal receipt images, or account records are copied into the candidate.

**No live or staging deployment has been performed by this branch.** PR is draft by design. Do not merge just to run the prototype.

## Product boundaries to decide

- Confirm base-CP conversion and whether `1.0, 1.5, 2.0, 2.5, 3.0` multipliers can stack; the preview deliberately applies **one at a time**.
- Verify East/West territory boundaries and ZIP-to-side rules, rather than assuming every Detroit ZIP maps cleanly to one side.
- Agree on CP review eligibility and fraud rules: duplicate receipts, repeated uploads, canceled/refunded purchases, first-visit detection, merchant attestation, and appeal/rollback.
- Separate **CP participation scores** from **7TRB**. CP is not cash, a transferable balance, a security, or guaranteed financial value.
- Define opt-in member/merchant onboarding and privacy; do not silently import Loop/Connect data.
- If receipt verification is built later, design private storage, access limits, retention policies, masking of addresses/payment details, and server-side human/moderator approval.
- A verified merchant directory and any production Nuru identity usage require independent integration review.

## Intended pilot sequence

1. Complete owner and access audit of existing staging.
2. Validate the static game flow with nonpersonal sample data, mobile layout, and accessibility.
3. Introduce server-backed test identities and sample merchants in an **isolated QA dataset**, not production.
4. Add receipt proof and moderator verification, then a reversible server-side CP ledger.
5. Test authorized Loop/Connect links (navigation first; consent-based data linking later), then optional Nuru participation.
6. Only after proven full-cycle tests, recruit the first 20 Detroit residents and five merchants.

## Local / CI tests

```sh
node --check rep-ur-city-preview/app.mjs
node --check rep-ur-city-preview/game-rules.mjs
node --test rep-ur-city-preview/game-rules.test.mjs
```

This is planning and demo code, not authority to publish, change DNS, migrate databases, issue CP/7TRB, or sign up real people.
