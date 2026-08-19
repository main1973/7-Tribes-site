# 7TRB.com Repository Cleanup Audit

## Scope and safety boundary

This audit covers only `main1973/7-Tribes-site`, the static repository that powers 7trb.com. No Loop or Connect backend, mobile-app project, database, contract address, token supply, network detail, or external ecosystem URL was changed.

The initial read-only scan found 122 repository files, including 26 HTML files: 25 public routes plus the Google ownership-verification file. It inspected 480 local references after accounting for CSS `url()` assets and custom URI schemes.

## Cleanup classification

| Classification | Items | Decision |
|---|---|---|
| Safe to remove | None | No route or asset was deleted. Direct traffic and dynamic references make apparent orphans and unused images unsafe for blind removal. |
| Needs review | `index-redesign.html`, `network.html`, `referrals.html`, `wallet.html`, `investor.html`, unreferenced image variants, partner images, and the missing investor deck | Retain until traffic, dynamic data, and business-owner review establish a safe replacement or redirect. |
| Must preserve | Homepage, Learn, Ecosystem, Transparency Hub, Dashboard, Builders, Developers, `/join`, `wallet/`, Google verification, PDFs under `docs/`, shared CSS/JS, data JSON, external Loop/Connect/Nuru/JollofSwap links | Retained unchanged except for verified factual and routing corrections. |
| Needs consolidation | Inline `<style>` blocks on most pages; repeated page-specific header/footer CSS; four remaining `style.css` consumers | Retained for a staged, visual-regression-tested extraction rather than risky bulk removal. |
| Needs correction | Broken local navigation targets, an obsolete Ethereum-specific FAQ, old buyback/staking assertions, unverified treasury claims, and missing Investor Deck file | Verified routes and claims were corrected where an existing canonical destination or Transparency-aligned replacement exists. The missing Investor Deck remains open. |

## Safe cleanup completed

| Type | File | Completed action |
|---|---|---|
| Broken internal link | `digital.html` | Repointed `apparel.html` to the existing `shop.html` route. |
| Broken internal link | `propose.html` | Repointed `merchant.html` to the existing `merchants.html` directory. |
| Broken official document link | `investor.html` | Repointed the Field Manual download to `docs/7TRB_Field_Manual.pdf`. |
| Outdated network wording | `purpose.html` | Replaced the Ethereum-specific FAQ with the current Alkebuleum/Nuru/ALKE orientation. |
| Unsupported economic claims | `handbook.html` | Removed assertions of treasury buybacks, liquidity staking, and DAO payouts; linked guidance to the Transparency Hub’s current allocation categories. |
| Transparency alignment | `ecosystem.html` | Removed claims that all treasury activity, staking, liquidity, and governance mechanics are currently available; directed visitors to the Transparency Hub and available tools. |

## Production validation

The deployment route sweep returned HTTP 200 for 24 of 25 public routes on first pass. Dashboard returned a transient 503 in the concurrent fetch, then loaded directly with HTTP 200 on the next request. Its public state remained accurate: **Open in Nuru**, unavailable metrics remained unavailable or integration-pending, and no wallet or treasury value was invented.

The first all-route sequential 390px frame sweep exceeded the browser execution limit before it could return a complete result. The temporary frame was removed, and the mobile audit continued in smaller route batches to keep the check resource-safe.

The first two 390px batches confirmed no horizontal overflow on Builders, Dashboard, Developers, Earn, Ecosystem, Exchange, and the legacy redesign route. Checkout, Digital, and Field Manual did not finish inside the short parallel-frame window and were reserved for slower isolated verification rather than treated as failures.

The next batches confirmed no horizontal overflow on Investor, Join, Learn, Merchants, Network, Propose, and Purpose. Homepage, Learn 7TRB, Onboarding, Purpose, Checkout, Digital, and Field Manual remained queued for slower isolated checks because their richer assets or scripts exceeded the lightweight parallel-frame deadline.

The final lightweight batch confirmed no horizontal overflow on Referrals, Transparency, Wallet, and the legacy Wallet page. Shop remained queued for the same short-frame timing limitation. A direct production-source verification confirmed all three repaired destinations and the corrected FAQ, while the removed buyback and staking assertions were absent from Handbook and Ecosystem.

## Final inventory

| Inventory item | Count / status |
|---|---|
| Files kept | 122 repository files retained during the safe-cleanup pass |
| Files removed | 0 |
| Files merged | 0; CSS/JS extraction is deferred to avoid layout regression |
| Files renamed | 0; live paths were preserved |
| Broken links fixed | 3 verified local/document route corrections |
| Duplicate assets removed | 0; all require dynamic-reference or traffic review |
| Remaining broken-reference exception | Missing `7TRB_Investor_Pitch_Deck.pdf` target; no verified replacement exists |
| Parser false positive | `join/index.html` CSS `url(target)` pattern; not a runtime route reference |
| Remaining technical debt | Inline styles on most pages, duplicate header/footer markup, legacy/orphan routes pending traffic review, `style.css` legacy consumers, and unreferenced asset candidates requiring data/traffic analysis |

### Files kept

The following public files were intentionally retained to preserve direct production access: `index.html`, `index-redesign.html`, `learn.html`, `learn-7trb.html`, `ecosystem.html`, `transparency.html`, `dashboard.html`, `builders.html`, `developers.html`, `digital.html`, `shop.html`, `checkout.html`, `earn.html`, `exchange.html`, `handbook.html`, `investor.html`, `merchants.html`, `network.html`, `onboarding.html`, `propose.html`, `purpose.html`, `referrals.html`, `wallet.html`, `wallet/index.html`, `join/index.html`, and `google8c0a443d6ccee643.html`.

All shared CSS/JavaScript, data files, official PDFs, the official 7TRB symbol variants, background assets, and all existing product/partner assets were also retained. No file was renamed, merged, or removed in this safe-cleanup pass.

### Remaining technical debt

| Area | Remaining work | Safety reason for deferral |
|---|---|---|
| Investor Deck | `7TRB_Investor_Pitch_Deck.pdf` is still absent | No verified replacement deck exists. |
| Legacy pages | `index-redesign.html`, `network.html`, `referrals.html`, and `wallet.html` are source-orphaned | Direct traffic and external bookmarks must be reviewed before redirecting or retiring routes. |
| Inline CSS/JS | Most public pages retain page-local presentation and behavior code | Bulk extraction would risk visual or functional regression without page-by-page screenshots and tests. |
| Duplicate/unused assets | 21 potentially unreferenced assets and five exact-content duplicate groups remain | Dynamic data, direct URLs, downloads, or future pages may rely on their names. |
| Mobile timing | Checkout, Digital, Field Manual, Homepage, Learn 7TRB, Onboarding, Purpose, and Shop exceeded short hidden-frame timing checks | Their direct routes return successfully; verify them visually in a dedicated low-memory browser pass before changing layout code. |

## Recommended next staged refactor

The safest next phase is to extract only shared header/footer and repeated breakpoint rules from two visually representative pages at a time, validate them at desktop and mobile widths, then continue iteratively. Do not delete legacy routes or image variants until production access logs and dynamic data references have been reviewed.
