// 7TRB Token contract on BSC/Ethereum
const TOKEN_ADDRESS = "0xD81641716926F6D55dC5AF6929dbE046bBf43c0D";
const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask to connect your wallet.");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const account = await signer.getAddress();

    document.getElementById("wallet-address").innerText =
      "Connected: " + account;

    // Load token contract
    const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

    // Get token info
    const [symbol, decimals, rawBalance] = await Promise.all([
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(account)
    ]);

    const balance = ethers.utils.formatUnits(rawBalance, decimals);

    document.getElementById("token-balance").innerText =
      `Your Balance: ${balance} ${symbol}`;
  } catch (err) {
    console.error("Wallet connect error:", err);
    alert("Connection failed: " + (err.message || err));
  }
}
