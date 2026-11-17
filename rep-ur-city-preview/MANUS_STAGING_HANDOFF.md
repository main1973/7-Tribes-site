# Rep Ur City: non-destructive handoff to existing Manus staging

Prepared 2026-11-16. This is a **deployment plan, not deployment evidence**.

## Verified existing project identity (from the owner's prior staging report)

- **Manus WebDev resource**: `wdp_00ff7fb070bde2ed4ee33604`
- **Manus application**: `bejJD8cgUjAHVNWTqrQd7S`
- **Existing staging domain**: `https://staging.7trb.com/`
- **Previously configured DNS**: `staging → cname.manus.space`
- **Last documented deployment**: `3ccabd110cbb4faf1e67fe69c19a6b91ac231886` (early November 2026; temporary Nuru chain-ID probe was removed)
- **Security**: local staging login; noindex/no-store; server-side account, session, Origin and browser-intent guards; Secure/HttpOnly cookie; auto-publish off. Keep all intact.
- **Existing synthetic modules**: Home/Learn/Ecosystem/Transparency/Dashboard/Builders/Developers, plus Profile, Loop and Connect functions.
- **Testers**: five individual tester slots previously prepared (3 initial, 2 reserves). They were left **disabled pending owner review**; no invitations were sent.
- **Map**: intentionally disabled on this isolated staging build; do not enable Maps API/location.
- **Nuru**: separate transient provider detection tested and removed; no Nuru wallet/identity/signing, token, transaction, payout or reward functions in staging.
- **Database**: owns a private isolated staging DB containing synthetic records, owner settings and protected feedback. Never wipe or recreate. Production keys, accounts and databases do not belong here.

**Current live host, DNS, UI, data, and restored backup status still need to be rechecked from inside the original Manus project.** The prior report establishes historical ownership/configuration only. Its full original content was sourced from owner's *Isolated_staging_outcomes (1).pdf*, not from a newly authenticated production inspection.

## Separate existing Rep Ur City development

An existing **mobile 7Tribes ecosystem app** repository, `main1973/7tribes-ecosystem-app`, already contains `app/rep-ur-city.tsx` and a **six-mission, device-local, non-financial pilot**:
1. Business Scout (`discover_business`)
2. Straight Talk (`share_honest_review`)
3. Loop Spark (`continue_loop`)
4. Listing Steward (`suggest_listing`)
5. Connection Carrier (`share_referral`)
6. Neighborhood Witness (`confirm_visit`)

That app's pilot is **not** a points ledger and is not automatically the source of the Manus staging site's web code. Do not port its APIs or native mobile storage into staging. Preserve it as a separate, established project.

The `rep-ur-city-preview/` folder in this **draft** GitHub PR is merely a proposed standalone HTML/CSS/JS *score-lab concept* (zero real users; 100 illustrative CP base; one multiplier at a time; session-only totals). It is **not** the previously tested staging product, a confirmed 7TRB reward scheme, or a deployable migration of the mobile app.

## Non-destructive implementation request — existing Manus project ONLY

1. Open the **existing** Manus application ID above. Identify its current source/version, GitHub sync (if any), real staging domain binding, security rules and database. Do **not** initiate a new Manus website or import the main `7-Tribes-site` repository over it.
2. Take a restorable **staging-only** snapshot of code/configuration and isolated staging data; record recovery steps and confirm ability to restore. Never use or touch live Loop/Connect/7Tribes databases.
3. Preserve original staging routes, owner profile, city preference, educational progress, synthetic posts/listings, tester accounts, bug reports and access protections. Keep the auto-publish toggle off.
4. Add an authenticated **Rep Ur City** entry point as a new additive route, e.g. `/rep-ur-city`, with an optional menu link inside the existing staging design. Do not replace Home or Dashboard.
5. Implement only the **demonstration view** from `rep-ur-city-preview/` behind the **existing staging server authentication gate**, not as an unprotected public standalone page. Do not copy real Connect merchant data or Nuru credentials.
6. Use **only synthetic** demo names and data. Keep score computations local and ephemeral; **0** initial East/West values. No receipt images/uploads, public user signup, payments, real 7TRB, wallet connections, rewards, smart contracts, GPS/location calls, third-party APIs, or messaging.
7. Keep the mobile app's six existing non-financial pilot missions intact, and label the new points score lab separately as *Illustrative CP — under review*, not verified production scoring.
8. Run local/preview tests without saving or changing production data: login; anonymous access denied; direct `/rep-ur-city` denied when unauthenticated; same-window internal navigation; mobile Nuru and Chrome layout; keyboard interactions; simulation and reset; logout/session revocation; no external calls; existing Profile/Loop/Connect still work and retain data after reload.
9. Present an explicit file diff, backup ID (not sensitive details), test evidence, and publication plan for owner review **before** publishing anything. Publish only after explicit approval and available Manus credits. Keep prod and DNS unchanged.
10. After publication, perform a real Nuru App Browser test by a permitted staging test account and compare to Chrome. No tester activation/invitations without another approval.

## Safe current status

- Draft static preview PR: `main1973/7-Tribes-site#15`; tests passed in GitHub.
- No GitHub PR merge, production change, Manus project edit, staging publish or DNS change has been performed.
- This source branch is **not** connected to the staging Manus app. Directly merging it to 7trb.com main will **not** deploy this feature to staging.
- Do not close the staging handoff tracking issue until the original Manus project is actually updated and verified.

## QA acceptance checklist

- [ ] Same original Manus project and resource IDs
- [ ] Verified current deployment source/version and staging-only backup
- [ ] Protected `/rep-ur-city` route; no unauthenticated game bundle/data exposure
- [ ] All existing routes, owner settings, tester slots, and synthetic records preserved
- [ ] Desktop and Nuru mobile rendering; no forced refresh / wallet methods
- [ ] Sample CP exact 100/150/200/250/300 for one selected sample multiplier, no stacking
- [ ] East/West board starts 0/0, only increases after local simulation, resets, refresh clears
- [ ] No production API, external integrations, tokens, receipts, signup or payment flows
- [ ] Explicit permission before publishing; rollback tested
