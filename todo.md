# Nuru/Web3 correction checklist

- [x] Inventory all legacy 7TRB contract references, balance displays, and Nuru integration code across 7trb.com.
- [x] Replace legacy contract references with the approved contract `0x991df36e5b0bb596a83dee6a840f78bAa40450e0`.
- [x] Build one shared Nuru state module with silent authorization restoration, identity retrieval, and provider-event handling.
- [x] Implement Alkebuleum chain verification, token-decimals lookup, and independent AA-wallet and signer balance reads.
- [x] Update Dashboard and any public Web3 surface to display AA Wallet 7TRB, Signer Address 7TRB, Total 7TRB, network, and last refresh without false zero values.
- [x] Ensure public content remains accessible outside Nuru and connect actions are explicit and user-controlled.
- [ ] Test normal-browser behavior, inspect deployed code, push the correction, and prepare the requested verification report.
- [ ] Correct narrow-screen Dashboard wallet-card wrapping while preserving verified Nuru values and the two-address balance logic.
- [ ] Add the Nuru Android device evidence to the verification report and complete the final acceptance record after the responsive refinement is live.
