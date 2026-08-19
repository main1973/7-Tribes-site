# Developer Portal Verification Sources

## Available now

| Resource | Verified evidence | Portal treatment |
|---|---|---|
| Alkebuleum Mainnet | Official network documentation lists Mainnet, chain ID `237422`, RPC `https://rpc.alkebuleum.com`, currency `ALKE`, 18 decimals, explorer, WebSocket RPC, and EIP-1559 support.[1] | Available now |
| EVM tooling | Official developer documentation states that Alkebuleum is EVM-compatible and documents ethers.js, viem, Hardhat, Foundry, Remix, standard JSON-RPC methods, and Solidity deployment.[1] | Available now |
| Explorer | `https://explorer.alkebuleum.com` returned HTTP 200 during the portal audit. Its direct contract-address route did not return successfully as a direct request, so the portal opens the verified explorer home and provides a copyable contract address for search. | Available now |
| 7TRB deployment | RPC returned chain ID `0x39f6e` (decimal `237422`), non-empty contract bytecode at `0x991df36e5b0bb596a83dee6a840f78bAa40450e0`, token name `7Tribes`, and symbol `7TRB`. | Available now |
| Official docs | `https://docs.alkebuleum.org` returned HTTP 200 and is linked from the official Alkebuleum website.[1] | Available now |
| Official developer GitHub | `https://github.com/Alkebuleum` returned HTTP 200. Its public repositories include `alkenetwork`, `docs`, and `jollofswap`.[2] | Available now |
| 7Tribes site repository | `https://github.com/main1973/7-Tribes-site` is a public repository on `main` with Issues enabled. | Available now |
| JollofSwap site | `https://jollofswap.com` returned HTTP 200. | Available now as a product link only |

## Not represented as operational

No verified public 7TRB ABI endpoint or ABI file was found during this audit. No official Alkebuleum testnet endpoint was found in the official network and developer documentation searched. The public JollofSwap repository describes mocked blockchain and chat flows, so the portal must not publish operational JollofSwap API or integration instructions.[3] 7Tribes-specific SDKs, API endpoints, token integration examples, dedicated developer documentation, and a dedicated developer Telegram channel were not verified.

## References

[1]: [Alkebuleum Developer Documentation](https://docs.alkebuleum.org)

[2]: [Alkebuleum GitHub Organization](https://github.com/Alkebuleum)

[3]: [Alkebuleum JollofSwap Repository](https://github.com/Alkebuleum/jollofswap)
