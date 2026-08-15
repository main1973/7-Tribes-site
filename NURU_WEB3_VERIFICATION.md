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

## Remaining device-specific verification

The actual Nuru Android dApp Browser is not available in this environment. The final acceptance steps requiring a live Nuru identity, AA wallet, signer address, and live wallet balances must be run inside that browser after deployment.
