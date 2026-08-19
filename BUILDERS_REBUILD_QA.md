# Builders Page Rebuild and Mobile QA

## Scope

Only `builders.html` was rebuilt for this task. The page now presents a mission-driven participation and recruitment surface without representing a guaranteed job, payment, token reward, ownership interest, equity interest, referral bounty, treasury allocation, on-chain payment, staking feature, or unimplemented integration.

## Deployed desktop verification

The live page after commit `5c64477` displayed the official 7TRB symbol, the new **BUILD WITH 7TRIBES** hero, the requested mission / real-world work / community impact cards, six contribution categories, the four-step process, participation models, participation notice, professional-interest list, and final CTA. The former large gold oval/banner source was removed: the rebuilt page uses contained background gradients inside the hero and footer only, with no floating fixed or absolute decorative element over page text.

## Claims removed or corrected

The page no longer says builders receive 7TRB, own what they build, gain an increasing stake, receive 100% 7TRB, follow fixed 30/40/30 payments, have payments logged on-chain, see what every builder earned, receive equity/ownership, or receive referral bounties. The rebuilt language states that opportunities may be volunteer, project/contract, paid staff, advisory/leadership, grant/program-funded, or mutually agreed 7TRB participation, subject to separate approval and documentation.

## Mobile audit status

The requested production width audit for 360px, 390px, 412px, and 430px is running through same-origin frames. The final measurements are appended after the stored audit result is retrieved.

## Mobile and link verification

At **360px, 390px, 412px, and 430px**, the production page reported scroll widths of **345px, 375px, 397px, and 415px**, respectively, with no horizontal overflow. The mobile menu toggle was present at every tested width. The hero ended cleanly before the first section at every width, confirming that no decorative layer overlaps page content. The primary **View Opportunities** action correctly navigated to `#contribute`; all contribution-category **Learn More** controls point to the internal involvement process rather than an invented job listing.

The external Join the Community controls use the existing Telegram destination. The final Learn About 7Tribes and Back to Home controls use the existing internal routes. No active payment, employment, equity, token-reward, staking, referral-bounty, or on-chain-payment functionality remains represented as operational.
