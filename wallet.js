/* wallet.js — 7TRB on Ethereum Mainnet with UX helpers */

const CONFIG = {
  NETWORK: "ethereum", // Ethereum mainnet
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

function setText(id, text){
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

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

function formatAmount(x){
  const n = Number(x);
  if (Number.isNaN(n)) return x;
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
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

    // show network name
    const netId = await provider.send("eth_chainId", []);
    const netName = (netId === "0x1") ? "Ethereum Mainnet" : `Chain ID: ${netId}`;
    setText("wallet-network", "Network: " + netName);

    // show address
    setText("wallet-address", "Connected: " + account);

    // copy address
    const copyBtn = document.getElementById("copy-addr");
    if (copyBtn) {
      copyBtn.onclick = () => navigator.clipboard.writeText(account);
    }

    // read token balance
    const c = new ethers.Contract(CONFIG.TOKEN_ADDRESS, CONFIG.TOKEN_ABI, provider);
    const [sym, dec, raw] = await Promise.all([c.symbol(), c.decimals(), c.balanceOf(account)]);
    let bal = ethers.utils.formatUnits(raw, dec);
    bal = formatAmount(bal);
    setText("token-balance", `Your Balance: ${bal} ${sym}`);

    // add-token to MetaMask
    const addBtn = document.getElementById("add-token");
    if (addBtn && window.ethereum?.request) {
      addBtn.onclick = async () => {
        try {
          await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
              type: "ERC20",
              options: {
                address: CONFIG.TOKEN_ADDRESS,
                symbol: sym,
                decimals: dec
              }
            }
          });
        } catch(e) { console.error("Add token failed", e); }
      };
    }
  } catch (e) {
    const msg = e?.message || String(e);
    if (msg.includes("User rejected")) {
      alert("You canceled the MetaMask request. Please try again.");
    } else if (msg.includes("Unsupported chain")) {
      alert("Please switch MetaMask to Ethereum Mainnet and try again.");
    } else {
      alert("Connection error: " + msg);
    }
    console.error(e);
  }
};
