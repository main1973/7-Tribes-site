// 7TRB Wallet Front-end (Alkebuleum)

// Chain + token config
const ALKE_RPC       = "https://rpc.alkebuleum.com";
const TOKEN_ADDRESS  = "0xdf7ce67dB19142672c4193d969cdD9975A5A6038";
const TOKEN_DECIMALS = 18;
const TOKEN_SYMBOL   = "7TRB";
const TREASURY_WALLET= "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB";

let browserProvider = null;
let account = null;

const $ = (id) => document.getElementById(id);

function short(addr){
  return addr ? addr.slice(0,6) + "..." + addr.slice(-4) : "—";
}
async function switchToAlkebuleum() {
  const params = {
    chainId: "0x39F8E",
    chainName: "Alkebuleum Mainnet",
    nativeCurrency: {
      name: "Alkebuleum Token",
      symbol: "AKE",
      decimals: 18
    },
    rpcUrls: ["https://rpc.alkebuleum.com"],
    blockExplorerUrls: ["https://explorer.alkebuleum.com"]
  };

  try {
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [params]
    });
  } catch (err) {
    console.error("Failed to add/switch to Alkebuleum:", err);
  }
}
async function connectWallet(){
  const status = $("status");
  if(typeof window.ethereum === "undefined"){
    alert("No wallet found. Open this page inside MetaMask / a Web3 wallet browser.");
    return;
  }
  try{
    browserProvider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await browserProvider.send("eth_requestAccounts", []);
    account = accounts[0];
    $("addr").textContent = short(account);
    $("connectBtn").textContent = short(account);
    await refreshBalances();
    status.textContent = "";
  }catch(err){
    console.error("Connect failed:", err);
    status.textContent = "Connection failed. Please try again.";
  }
}

async function refreshBalances(){
  if(!account) return;
  const status = $("status");
  try{
    // Gas balance (AKE) - reads from Alkebuleum RPC
    const rpc = new ethers.JsonRpcProvider(ALKE_RPC);
    const gasRaw = await rpc.getBalance(account);
    const gasBal = Number(ethers.formatEther(gasRaw));
    $("gasBal").textContent = gasBal.toFixed(6) + " AKE";

    // Token contract
    const erc = new ethers.Contract(
      TOKEN_ADDRESS,
      [
        "function balanceOf(address) view returns (uint256)"
      ],
      rpc
    );

    const userRaw = await erc.balanceOf(account);
    const userBal = Number(ethers.formatUnits(userRaw, TOKEN_DECIMALS));
    $("trbBal").textContent = userBal.toFixed(6) + " " + TOKEN_SYMBOL;

    const tRaw = await erc.balanceOf(TREASURY_WALLET);
    const tBal = Number(ethers.formatUnits(tRaw, TOKEN_DECIMALS));
    $("treasuryBal").textContent = tBal.toFixed(6) + " " + TOKEN_SYMBOL;

  }catch(err){
    console.error("Balance error:", err);
    status.textContent = "Error reading balances from Alkebuleum.";
  }
}

async function send7TRB(){
  const status = $("status");
  status.textContent = "";

  if(!browserProvider || !account){
    status.textContent = "Connect your wallet first.";
    return;
  }

  const to = $("to").value.trim();
  const amt = $("amt").value.trim();

  if(!/^0x[a-fA-F0-9]{40}$/.test(to)){
    status.textContent = "Invalid recipient address.";
    return;
  }
  if(!amt || Number(amt) <= 0){
    status.textContent = "Enter a valid amount.";
    return;
  }

  try{
    const signer = await browserProvider.getSigner();
    const erc = new ethers.Contract(
      TOKEN_ADDRESS,
      ["function transfer(address to, uint256 amount) returns (bool)"],
      signer
    );

    const value = ethers.parseUnits(amt.toString(), TOKEN_DECIMALS);
    status.textContent = "Sending transaction...";
    const tx = await erc.transfer(to, value, {
      gasLimit: 250_000
    });
    status.textContent = "Pending: " + tx.hash;
    const rcpt = await tx.wait();
    status.textContent = "Confirmed in block " + rcpt.blockNumber;
    await refreshBalances();
  }catch(err){
    console.error("Send failed:", err);
    status.textContent = err.shortMessage || err.message || "Transaction failed.";
  }
}

async function copyAddress(){
  if(!account) return;
  try{
    await navigator.clipboard.writeText(account);
    $("status").textContent = "Address copied.";
  }catch{
    $("status").textContent = "Copy failed.";
  }
}

async function autoConnect(){
  if(typeof window.ethereum === "undefined") return;
  try{
    browserProvider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await browserProvider.send("eth_accounts", []);
    if(accounts.length){
      account = accounts[0];
      $("addr").textContent = short(account);
      $("connectBtn").textContent = short(account);
      await refreshBalances();
    }
    window.ethereum.on?.("accountsChanged", async (acc) => {
      if(acc.length){
        account = acc[0];
        $("addr").textContent = short(account);
        $("connectBtn").textContent = short(account);
        await refreshBalances();
      }else{
        account = null;
        $("addr").textContent = "Not connected";
        $("connectBtn").textContent = "Connect Wallet";
        $("gasBal").textContent = "—";
        $("trbBal").textContent = "—";
        $("treasuryBal").textContent = "—";
      }
    });
  }catch(err){
    console.error("Auto-connect error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("connectBtn").addEventListener("click", connectWallet);
  $("send").addEventListener("click", send7TRB);
  $("copyAddr").addEventListener("click", copyAddress);
  autoConnect();
});
