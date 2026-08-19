# Developer Resources Portal QA

## Scope

Only `developers.html` was rebuilt. The portal separates source-backed resources from unverified capabilities. It retains the official 7TRB symbol and the site’s dark navy, black, and gold visual system without using a replacement token icon or stock imagery.

## Technical resources made available

The live portal displays the verified Alkebuleum Mainnet configuration: chain ID `237422`, RPC `https://rpc.alkebuleum.com`, native currency `ALKE`, EVM/EIP-1559 compatibility, official explorer, and official developer documentation. It also displays the 7TRB contract `0x991df36e5b0bb596a83dee6a840f78bAa40450e0`, source-verified token name `7Tribes`, symbol `7TRB`, a contract-explorer destination, and copy controls.

## Unavailable functionality clearly labeled

The portal marks the public 7TRB ABI, 7Tribes-specific token guide, JollofSwap API/integration instructions, official public testnet, 7Tribes SDKs/APIs, governance development resources, advanced analytics, and additional developer tools as **Coming Soon** or unverified. It does not display an unverified endpoint, ABI, testnet, API, bridge, staking capability, trading-bot feature, or invented documentation link.

## Desktop production check

The production page after commit `1b56054` displayed the compact hero, Network Information, 7TRB Contract, Quick Start, Integration Guides, What Developers Can Build, GitHub, Developer Support, and Coming Soon sections. The network and contract cards were rendered without decorative overlap. The mobile-width audit is running through same-origin production frames; the stored results are appended after retrieval.

## Mobile and control verification

At **360px, 390px, 412px, and 430px**, the production page reported scroll widths of **345px, 375px, 397px, and 415px**, with no horizontal overflow. Each tested frame contained all **12** portal cards, a shared mobile navigation toggle, a clear hero-to-network-section boundary, and an internally contained horizontal-scroll code block. No decorative layer crossed over content, controls, or cards.

The Chain ID copy control changed to **Copied** when used in production. All visible resource links use source-verified destinations, and unavailable guides have no fake action button.

## Final destination correction

The first direct contract-address explorer route returned HTTP 404 during external-destination validation. It was removed rather than left as a broken link. The deployed portal now uses the verified explorer home (`https://explorer.alkebuleum.com`) and instructs developers to copy the verified contract address into the explorer search field. The final production view shows **Open Explorer** and no unverified direct-address destination.
