# Nuru/Web3 Integration Verification

## Deployment

The Nuru/Web3 correction is deployed on the `main` branch at commit `f24c30a`, following the implementation commit `b6f982f`.

## Confirmed public-browser behavior

The live `https://7trb.com/dashboard.html` page was opened in a normal browser context. Public page content loaded without requiring a wallet login. The Dashboard showed one **Open in Nuru** action, did not show a connected wallet, and did not display a fabricated 7TRB balance. It also loaded the current Alkebuleum block number successfully.

## Controlled provider verification

The deployed Dashboard was exercised with a controlled Nuru-compatible provider. Silent `eth_accounts` restoration produced the following expected state:

| Check | Observed result | Status |
|---|---:|---|
| Nuru provider detection | `_isNuruWallet: true` detected | Pass |
| Silent authorization restoration | `authorized: true` | Pass |
| Token decimals | `18` from `decimals()` | Pass |
| AA Wallet 7TRB | `1.25` | Pass |
| Signer Address 7TRB | `2` | Pass |
| Combined 7TRB | `3.25` | Pass |
| Alkebuleum verification | `onAlkebuleum: true` | Pass |

The deterministic `tests/nuru-state.test.cjs` test additionally checks that initial loading does not call `eth_requestAccounts`, that both address balances are queried, that wrong-chain reads are not presented as zero, and that an account disconnect clears stale identity and balances.

## Actual Nuru Android dApp Browser verification

The supplied Nuru Android screenshots show the deployed Dashboard in an authorized Nuru state. The Dashboard displayed **Nuru Connected**, the primary handle **7tribes.alke**, and AIN **aa0000108**. The active network was **Alkebuleum** and the balance-status card showed **Live**.

| Check | Observed device result | Status |
|---|---|---|
| Public site opens in Nuru | Dashboard loaded in the Nuru dApp Browser | Pass |
| Authorized identity | `Nuru Connected` | Pass |
| Primary handle | `7tribes.alke` | Pass |
| AIN | `aa0000108` | Pass |
| Signer address displayed | Truncated copyable UI value shown as `0x26b0…2bab` | Pass |
| AA wallet displayed | Truncated copyable UI value shown as `0x0f6d…442e` | Pass |
| AA Wallet 7TRB | `20,000,000 7TRB` | Pass |
| Signer Address 7TRB | `0 7TRB` | Pass |
| Combined Total 7TRB | `20,000,000 7TRB` | Pass |
| Arithmetic | `20,000,000 + 0 = 20,000,000` | Pass |
| Token network | `Alkebuleum` | Pass |
| Native AA-wallet balance | `5 ALKE` | Pass |
| Last refresh | Device displayed `8/15/2026, 6:29:55 AM` | Pass |

The screenshots intentionally expose only shortened address values; this record does not infer or store full wallet addresses that were not displayed. The initial screenshots revealed narrow-screen wrapping in the two-column wallet-card layout. Commit `6ca9f13` changes the Nuru wallet fields to a one-column layout at `640px` and below, with ellipsis handling for shortened copyable addresses.

## Final responsive confirmation

A refreshed Nuru Android screenshot confirmed that the Nuru connection, identity, network, and chain-refresh states remained intact after the mobile refinement. The wallet-detail area begins as a single full-width card beneath the top Dashboard cards, replacing the former cramped two-column presentation. No new wrapping defect is visible in the refreshed view.
