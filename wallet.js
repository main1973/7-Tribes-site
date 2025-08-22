// 7TRB Token contract
const TOKEN_ADDRESS = "0xD81641716926F6D55dC5AF6929dbE046bBf43c0D";
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask to connect your wallet.");
    return;
  }

  try {
    // connect to MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const account = await signer.getAddress();

    document.getElementById("wallet-address").innerText =
      "Connected: " + account;

    // load 7TRB contract
    const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

    // get balance
    const [decimals, symbol, rawBalance] = await Promise.all([
      contract.decimals(),
      contract.symbol(),
      contract.balanceOf(account)
    ]);

    const balance = ethers.utils.formatUnits(rawBalance, decimals);

    document.getElementById("token-balance").innerText =
      `Your Balance: ${balance} ${symbol}`;
  } catch (err) {
    console.error(err);
    alert("Connection failed: " + (err.message || err));
  }
}
