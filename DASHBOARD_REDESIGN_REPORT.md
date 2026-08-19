# 7TRB Ecosystem Dashboard Redesign

## Scope

The Dashboard was redesigned as a public **7Tribes Ecosystem Dashboard**. It no longer presents itself as a Nuru account, identity, balance, or wallet interface. No Loop, Connect, mobile-app, or database code was changed.

## Data-source audit

| Source | Dashboard treatment | Reason |
|---|---|---|
| Alkebuleum RPC `eth_blockNumber` | Displayed as live current block height | The Dashboard makes a direct current RPC request. |
| 7TRB contract address | Displayed with copy action and explorer access | The address matches the Transparency Hub. |
| `data/metrics.json` / daily updater | Not displayed | The updater remains Ethereum/Etherscan-based and is not suitable as current 7Tribes ecosystem reporting. |
| `data/merchants.json` | Not displayed as participation | It contains only two name/city entries and no verified 7TRB acceptance, category, membership, or coordinates. |
| Loop / Connect activity | Explicit empty states | No verified controlled API or data export is connected to this static Dashboard. |
| Nuru provider data | Not displayed | The Dashboard does not assume access to Nuru identity, account, wallet, balance, reputation, or rewards. |

## Live verification

Production Dashboard verification after commit `0cefbee` confirmed the new public hero, explicit unconnected-data states, compact community/commerce/circulation/project sections, and the live Alkebuleum block height **4,634,935** at the time of the check. The contract displayed was `0x991df36e5b0bb596a83dee6a840f78bAa40450e0`. No Nuru wallet panel, identity field, balance card, merchant map, Chart.js, Ethers.js, Leaflet, or Nuru client dependency remains on the Dashboard route.

The live browser console contained no client-side output or error after Dashboard load.

## Mobile verification

The requested 360px, 390px, 412px, and 430px same-origin iframe audit was started sequentially in the production browser. This environment did not emit the delayed aggregate result, so the final width check continues through a lightweight alternate browser capture rather than treating the missing console log as a successful assertion.

The alternate stored audit completed successfully. At **360px, 390px, 412px, and 430px**, the Dashboard reported scroll widths of **345px, 375px, 397px, and 415px** respectively, with **no horizontal overflow** at any width. The shared mobile navigation toggle was present at every tested width.
