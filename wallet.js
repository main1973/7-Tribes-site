// wallet.js
const TOKEN_ADDRESS = "0xD81641716926F6D55dC5AF6929dbE046bBf43c0D"; // 7TRB contract
const TOKEN_DECIMALS = 18;
const TOKEN_SYMBOL = "7TRB";

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("No wallet found. Please install MetaMask or a compatible wallet.");
    return;
  }

  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    updateButton(account);
    await showBalance(account);
  } catch (err) {
    console.error("Wallet connection error:", err);
  }
}

function updateButton(account) {
  const btn = document.getElementById("connectBtn");
  if (btn && account) {
    btn.textContent = account.slice(0, 6) + "..." + account.slice(-4);
    btn.style.background = "linear-gradient(90deg, #FFD700, #b8912f)";
  }
}

// Show 7TRB balance
async function showBalance(account) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      TOKEN_ADDRESS,
      [
        "function balanceOf(address owner) view returns (uint256)",
        "function symbol() view returns (string)",
      ],
      provider
    );
    const raw = await contract.balanceOf(account);
    const formatted = Number(raw) / 10 ** TOKEN_DECIMALS;
    const balanceEl = document.getElementById("walletBalance");
    balanceEl.textContent = `${formatted.toFixed(3)} ${TOKEN_SYMBOL}`;
  } catch (err) {
    console.error("Balance fetch failed:", err);
  }
}

// Auto-check on load
async function checkConnection() {
  if (typeof window.ethereum === "undefined") return;
  try {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      const account = accounts[0];
      updateButton(account);
      await showBalance(account);
    }
  } catch (err) {
    console.error("Auto-connect check failed:", err);
  }
}

// React to wallet changes
if (typeof window.ethereum !== "undefined") {
  ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length > 0) {
      updateButton(accounts[0]);
      showBalance(accounts[0]);
    } else {
      document.getElementById("connectBtn").textContent = "Connect Wallet";
      document.getElementById("walletBalance").textContent = "";
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectBtn");
  if (btn) btn.addEventListener("click", connectWallet);
  checkConnection();
});
