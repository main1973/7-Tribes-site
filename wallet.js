/* wallet.js v4 — with network switch + debug logs */

console.log("[wallet.js] script loaded");

// --- CONFIG ---
// If 7TRB is on BSC, set NETWORK to "bsc"; if on Ethereum mainnet, set "ethereum"
const CONFIG = {
  NETWORK: "ethereum", // change to "bsc" if your token is on BSC
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
    }
  }
};

async function ensureCorrectNetwork(provider) {
  const desired = CONFIG.CHAINS[CONFIG.NETWORK];
  const current = await provider.send("eth_chainId", []);
  console.log("[wallet.js] current chain:", current, "desired:", desired.chainId);

  if (current.toLowerCase() === desired.chainId.toLowerCase()) return true;

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: desired.chainId }]);
    console.log("[wallet.js] switched to desired chain");
    return true;
  } catch (switchErr) {
    console.warn("[wallet.js] switch error:", switchErr);
    if (switchErr && switchErr.code === 4902) {
      try {
        await provider.send("wallet_addEthereumChain", [desired]);
        console.log("[wallet.js] chain added, switched");
        return true;
      } catch (addErr) {
        console.error("[wallet.js] add chain error:", addErr);
        alert("Please approve network add/switch in MetaMask to continue.");
        return false;
      }
    } else {
      alert("Please switch MetaMask to: " + desired.chainName);
      return false;
    }
  }
}

// expose globally
window.connectWallet = async function connectWallet() {
  try {
    console.log("[wallet.js] connectWallet clicked");

    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet.");
      return;
    }
    if (!window.ethers) {
      alert("Ethers not loaded. Hard refresh the page and try again.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    console.log("[wallet.js] accounts requested");

    // Enforce the correct network (change CONFIG.NETWORK if needed)
    const ok = await ensureCorrectNetwork(provider);
    if (!ok) return;

    const signer = provider.getSigner();
    const account = await signer.getAddress();
    console.log("[wallet.js] connected account:", account);

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
    console.log("[wallet.js] token:", symbol, "decimals:", decimals, "balance:", balance);

    const balEl = document.getElementById("token-balance");
    if (balEl) balEl.innerText = `Your Balance: ${balance} ${symbol}`;
  } catch (err) {
    console.error("[wallet.js] error:", err);
    alert("Connection failed: " + (err?.message || err));
  }
};
