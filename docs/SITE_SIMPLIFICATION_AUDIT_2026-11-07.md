# 7Tribes website clarity and Nuru audit — November 7, 2026

## Scope
Public presentation copy only. Pages: `index.html`, `transparency.html`, `ecosystem.html`, `join/index.html`, `wallet.html`, `learn.html`, and `purpose.html`. No edits to contracts, Nuru wallet provider code, referrals, authentication, membership storage, or payments.

## Key findings
1. **Homepage overload.** The live page carried a full-screen hero plus many repeated concept sections, a three-question Academy preview, a scenario simulator, seven roles, multiple closing links, and repeated calls to action. Some sections were hidden by inline CSS while still present in the document.
2. **Confusing status claims.** The Transparency page listed an Nuru mobile app as "in development" despite its public mobile release, and mixed published contract information with unverified treasury allocations, draft profit splits, and planned capabilities.
3. **Nuru ambiguity across pages.** Several pages described the available Nuru wallet as potentially available or labeled it "Download the App" alongside a distinct 7Tribes app link. Some copy promised 7TRB wallet functions or future rewards before integration was complete.
4. **Incorrect learning link.** The Learn page linked to `index.html#transparency` although that destination was not present on the homepage.

## Changes
- **Home:** shorter hero, one explanation, three pathways (Loop, Connect, Learn), one accurate Nuru introduction, one closing join action; retain original black-and-gold branding, mobile navigation, account/profile CTA behavior, footer, and ecosystem links.
- **Transparency:** readable stage list, published token data and explorer link, explicit treasury reporting gaps, truthful Nuru availability vs 7Tribes integration status, brief roadmap, expandable documents, risk notice and contact path. Removed unverified reporting presented like finished data and a duplicate Academy navigation link.
- **Nuru:** aligned public pages: Nuru is an available and independently operated Alkebuleum Technology wallet; 7Tribes wallet integration is still being tested/refined. The Nuru app and the 7Tribes app are not the same product.
- **Learn:** repaired Transparency destination and replaced suggestions that unlaunched rewards/merchant payments are active.

## Verification performed
- Fetched repository files and public 7trb.com pages for audit.
- Checked official Nuru site and public app listing for app availability.
- Checked updated HTML for one main section, no duplicate IDs or missing same-page hash targets (static checks only).
- Confirmed deleted homepage JavaScript did not leave an unconditional simulator call or Academy quiz initializer.
- Confirmed all changed files committed to the review branch.

## Still to verify before production release
- Mobile browser and actual Nuru dApp browser visual checks at narrow viewport sizes.
- Join/profile signup, Loop and Connect navigation, and back buttons.
- Copy-contract clipboard on secure-context browser, nav drawer, and existing visitor counter.
- No automatic claim of verified treasury amount until real wallet addresses and reconciliation records are published.
- Deployed site may stay unchanged until the pull request is merged and hosting completes.

The existing PDFs may contain older plans. This audit does not independently confirm contract transactions, wallet holdings, liquidity depth, merchant transaction completion, or whether all 7Tribes features work in production.
