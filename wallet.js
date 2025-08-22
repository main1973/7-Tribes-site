/* ===== 7TRB wallet connect with network switching =====
   How to choose your chain:
   - For Ethereum Mainnet:   set CONFIG.NETWORK = "ethereum"
   - For BSC Mainnet:        set CONFIG.NETWORK = "bsc"
   - For Sepolia testnet:    set CONFIG.NETWORK = "sepolia"
*/

const CONFIG = {
  NETWORK: "ethereum", // <-- CHANGE HERE if needed: "ethereum" | "bsc" | "sepolia"
  TOKEN_ADDRESS: "0xD81641716926F6D55dC5AF6929dbE046bBf43c0D",
  TOKEN_ABI: [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)"
  ],
  CHAINS: {
    ethereum: {
      chainId: "0x1",
      chainName: "Ethereum Mainnet",
      rpcUrls: ["https://rpc.ankr.com/eth", "https://cloudflare-eth.com"],
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      blockExplorerUrls: ["https://etherscan.io/"]
    },
    bsc: {
      chainId: "0x38",
      chainName: "BNB Smart Chain",
      rpcUrls: ["https://bsc-dataseed.binance.org/"],
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      blockExplorerUrls: ["https://bscscan.com/"]
    },
    sepolia: {
      chainId: "0xaa36a7",
      chainName: "Sepolia Test Network",
      rpcUrls: ["https://rpc.sepolia.org"],
      nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
      blockExplorerUrls: ["https://sepolia.etherscan.io/"]
    }
  }
};

async function ensureCorrectNetwork(provider) {
  const desired = CONFIG.CHAINS[CONFIG.NETWORK];
  const current = await provider.send("eth_chainId", []);

  if (current.toLowerCase() === desired.chainId.toLowerCase()) return true;

  // Try to switch first
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: desired.chainId }]);
    return true;
  } catch (switchErr) {
    // If the chain is not added in MetaMask, add it
    if (switchErr && switchErr.code === 4902) {
      try {
        await provider.send("wallet_addEthereumChain", [desired]);
        return true;
      } catch (addErr) {
        alert("Please approve network add/switch in MetaMask to continue.");
        return false;
      }
    } else {
      alert("Please switch MetaMask to: " + desired.chainName);
      return false;
    }
  }
}

window.connectWallet = async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask to connect your wallet.");
    return;
  }

  try {
    // Ensure ethers is present (in case the page cached a bad load)
    if (!window.ethers) {
      alert("Ethers library not loaded. Refresh the page and try again.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    // Enforce the correct network for the token
    const ok = await ensureCorrectNetwork(provider);
    if (!ok) return;

    const signer = provider.getSigner();
    const account = await signer.getAddress();

    const addrEl = document.getElementById("wallet-address");
    if (addrEl) addrEl.innerText = "Connected: " + account;

    // Read token balance
    const contract = new ethers.Contract(CONFIG.TOKEN_ADDRESS, CONFIG.TOKEN_ABI, provider);
    const [symbol, decimals, rawBalance] = await Promise.all([
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(account)
    ]);
    const balance = ethers.utils.formatUnits(rawBalance, decimals);

    const balEl = document.getElementById("token-balance");
    if (balEl) balEl.innerText = `Your Balance: ${balance} ${symbol}`;
  } catch (err) {
    console.error(err);
    alert("Connection failed: " + (err?.message || err));
  }
};
