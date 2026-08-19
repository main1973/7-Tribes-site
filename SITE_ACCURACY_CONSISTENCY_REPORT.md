# 7trb.com Accuracy and Consistency Pass

## Scope and source of truth

This pass applied only factual, terminology, status, navigation-support, footer-support, icon, CTA, and responsive corrections to the static **7trb.com** repository. It did not modify Loop, Connect, any mobile application project, databases, verified token details, the official contract address, token supply, or external URLs.

The current Transparency Hub was treated as the source of truth for public feature status. The live 7TRB network/token contract and JollofSwap liquidity access remain described as live. Treasury reporting remains **In Development**; merchant onboarding/payment acceptance remains **Testing**; governance/voting remains **Planned**; staking remains **Not Yet Available**; Nuru mobile/7Tribes-specific integration, referrals/rewards, and reputation remain **In Development**.[1]

## Cross-site corrections

| Area | Correction | Coverage |
|---|---|---|
| Status accuracy | Replaced claims of live voting, staking, guaranteed rewards, referral payouts, treasury reporting, merchant acceptance, and complete Nuru integration with current staged-status language. | Homepage, Ecosystem, Learn, Handbook, Purpose, Builders, Developers, Earn, Exchange, Network, Merchants, Onboarding, Join, Wallet, and Dashboard. |
| Nuru terminology | Retained working Nuru and Play Store links, but reworded them as external wallet/Web3 access; 7Tribes-specific identity, reputation, rewards, and wallet integration are identified as in development. | Primary education, gateway, onboarding, and wallet surfaces. |
| Dashboard truthfulness | Changed non-live reputation, referral, active-wallet, and treasury labels to **In Development** while retaining real Nuru browser, two-address balance, network, and zero/unavailable behavior. | Dashboard HTML and controller. |
| Illustrative data | Labeled Exchange, Network, and Referrals content as pilot/development examples rather than active merchant/reward/referral reports. | Exchange, Network, Referrals, Merchants, Earn. |
| Footer support | Added a canonical shared fallback footer only to active legacy pages that lacked a footer. Existing footers were preserved. | Digital, Earn, Merchants, Referrals, Wallet. |
| Copyright and icons | Updated stale 2025 copyright references to 2026 and removed user-facing emoji icons from ecosystem/developer/builder/handbook/error surfaces. | All active top-level pages with stale instances. |
| Responsive safety | Corrected invalid media-query syntax and replaced legacy `calc(100% - 32px)` button widths with full container width inside existing responsive rules. | 17 active pages with the unsafe mobile override. |

## Preserved behavior

The public Dashboard remains public outside Nuru and continues to display unavailable or pending states instead of fabricated balances. The live token contract, total supply, network details, external Loop/Connect/Nuru/JollofSwap/Telegram destinations, referral-safe `/join` behavior, forms, official document links, and current content hierarchy were preserved.

## Validation results

| Check | Result |
|---|---|
| Stale copyright source search | No remaining `© 2025` references in active HTML. |
| Invalid `@media max-width:min(...)` source search | No remaining invalid instances. |
| Legacy mobile `width: calc(100% - 32px) !important` source search | No remaining active instances. |
| Targeted emoji icon source search | No remaining user-facing instances in active content/error states. |
| Targeted high-risk claim search | No remaining matches for the corrected voting, staking, treasury, referral-reward, or complete-Nuru phrasing. |
| JavaScript syntax | `dashboard.js`, `nav.js`, and the shared fallback-footer script passed syntax checks. |

## Production verification

The deployed homepage was rechecked after commit `b72e49b`. The live page shows the corrected 2026 footer, labels Nuru as **External wallet + Web3 access**, presents merchant tools as testing, and describes referral/reward functionality as in development. The Scenario Lab continues to label its output as illustrative rather than live ecosystem data.

The browser console did not return the asynchronous all-route fetch aggregate in this environment. The route sweep therefore continues through a non-interactive production response check rather than treating the absent console value as a validation result.

The non-interactive production sweep returned **HTTP 200 for all 25 active routes**. A representative 390px iframe audit was started for the homepage, Ecosystem, Dashboard, Learn, Merchants, and Join gateway; this browser environment did not emit the delayed aggregate frame result. The shared responsive safeguards and source-level width checks remain in place, and no production route or source-level overflow regression was identified in this pass.

## Founder-review items

The following items were not changed because the Transparency Hub does not verify them. They require founder confirmation before any public claim is added or removed: fundraising ranges and use-of-funds allocation on the Investor page; the availability of specific digital-product/Gumroad offers; the operational status of the public merchant directory entries; and whether external Nuru app downloads should remain promoted while 7Tribes-specific integration remains in development.

## References

[1]: transparency.html "7TRB Transparency Hub" — current public status matrix and token information.
