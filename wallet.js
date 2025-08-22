/* wallet.js (resilient loader) */

// Your ERC-20 token (update if redeployed)
const TOKEN_ADDRESS = "0xD81641716926F6D55dC5AF6929dbE046bBf43c0D";
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// ---- Load ethers.js if it's not present ----
(function loadEthersIfNeeded(cb) {
  if (window.ethers) return cb();

  const cdns = [
    "https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js",
    "https://unpkg.com/ethers@5.7.2/dist/ethers.umd.min.js",
    "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.min.js"
  ];

  function tryNext() {
    if (!cdns.length) {
      alert("Failed to load ethers.js. Check your connection and try again.");
      return;
    }
    const src = cdns.shift();
    const s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    s.onerror = tryNext;
    document.head.appendChild(s);
  }
  tryNext();
})(function ready() {
  // Expose connectWallet globally for the button onclick
  window.connectWallet = async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet.");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();

      const addrEl = document.getElementById("wallet-address");
      if (addrEl) addrEl.innerText = "Connected: " + account;

      // Read token balance
      const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const [decimals, symbol, rawBalance] = await Promise.all([
        contract.decimals(),
        contract.symbol(),
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
});
