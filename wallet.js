/* wallet.js — 7TRB on Ethereum Mainnet */

const CONFIG = {
  NETWORK: "ethereum", // <-- Ethereum mainnet
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
    }
  }
};

async function ensureCorrectNetwork(provider) {
  const desired = CONFIG.CHAINS[CONFIG.NETWORK];
  const current = await provider.send("eth_chainId", []);
  if (current.toLowerCase() === desired.chainId.toLowerCase()) return true;

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: desired.chainId }]);
    return true;
  } catch (err) {
    alert("Please switch MetaMask to Ethereum Mainnet and retry.");
    return false;
  }
}

window.connectWallet = async function connectWallet() {
  try {
    if (!window.ethereum) { alert("Please install MetaMask."); return; }
    if (!window.ethers)   { alert("Ethers failed to load. Refresh and try again."); return; }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    // enforce Ethereum mainnet
    const ok = await ensureCorrectNetwork(provider);
    if (!ok) return;

    const signer = provider.getSigner();
    const account = await signer.getAddress();

    const addrEl = document.getElementById("wallet-address");
    if (addrEl) addrEl.innerText = "Connected: " + account;

    const c = new ethers.Contract(CONFIG.TOKEN_ADDRESS, CONFIG.TOKEN_ABI, provider);
    const [sym, dec, raw] = await Promise.all([c.symbol(), c.decimals(), c.balanceOf(account)]);
    const bal = ethers.utils.formatUnits(raw, dec);

    const balEl = document.getElementById("token-balance");
    if (balEl) balEl.innerText = `Your Balance: ${bal} ${sym}`;
  } catch (e) {
    console.error(e);
    alert("Connection failed: " + (e?.message || e));
  }
};
