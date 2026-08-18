# Unity Platform and Join Gateway Verification

## Scope boundary

This change was limited to the **7trb.com website repository**. No Loop, Connect, mobile-app, or database code was modified.

## Original request and completed delivery

The homepage now introduces **7TRIBES — THE UNITY PLATFORM** with the requested primary message, ecosystem entry actions, and top-of-page ecosystem-layer summary. The existing educational sections remain available below the platform entry layer. The scenario tool now explicitly identifies its values as illustrative, and the former Detroit number cards were replaced with qualitative community-focus cards rather than unsupported live metrics.

The production referral gateway is available at [https://7trb.com/join](https://7trb.com/join). It accepts a validated `ref` query parameter, stores it for the join session, keeps it out of visible page copy, and passes it only through the intended external onboarding actions.

## Production verification

| Check | Result | Evidence |
|---|---|---|
| Homepage release | Pass | Live homepage title and hero display **7TRIBES — THE UNITY PLATFORM**. |
| Top ecosystem layer | Pass | Loop, Connect, Nuru, 7TRB, and Alkebuleum appear directly below the hero. |
| Educational content placement | Pass | Why Communities Struggle, Organize, Build, Circulate, Blueprint, and the scenario tool render below the entry layer. |
| Simulated metrics | Pass | The scenario tool is labeled illustrative; Detroit no longer displays unsourced numbers. |
| `/join` route | Pass | `https://7trb.com/join` resolves to the production gateway. |
| `/join?ref=TESTCODE` | Pass | The route loads, indicates a referral is applied without displaying the code, and preserves it in session storage. |
| Query retention | Pass | Loop and Connect actions include `ref=TESTCODE`; the Play Store action receives an encoded Android referrer. |
| Mobile layout | Pass | A 375px production frame rendered as a single-column layout with no horizontal overflow. |
| Loop, Connect, and Nuru destinations | Pass | Each referenced destination returned HTTP 200 during verification. |

## Release record

| Item | Status |
|---|---|
| Primary implementation commit | `110a3d9` — pushed to `main` |
| Deployment | Live on `https://7trb.com` |
| Live route verification | Completed on 2026-08-18 |
| Remaining defects in this scope | None observed during the defined route, link, and mobile checks |
