<!-- keep this script include -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
<script>
/* wallet.js (safe version) */
(function () {
  const MM_INSTALL = "https://metamask.io/download/";

  function short(addr){ return addr ? addr.slice(0,6)+"…"+addr.slice(-4) : ""; }

  // Expose one function the button can call
  window.connectWallet = async function () {
    try {
      if (!window.ethereum) {
        // no MetaMask: open install page instead of throwing
        window.open(MM_INSTALL, "_blank", "noopener");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

      // request accounts
      await provider.send("eth_requestAccounts", []);
      const signer  = provider.getSigner();
      const address = await signer.getAddress();

      // ensure Ethereum mainnet (0x1)
      const net = await provider.getNetwork();
      if (net.chainId !== 1) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x1" }]
          });
        } catch (e) {
          // user rejected or chain not available; just inform and continue
          console.warn("Not on Ethereum mainnet:", e);
        }
      }

      // UI: show connected address
      const wrap = document.querySelector(".wallet-connect");
      if (wrap) wrap.innerHTML = `✅ Connected: <strong>${short(address)}</strong>`;

      // react to changes
      if (window.ethereum && window.ethereum.on) {
        window.ethereum.on("accountsChanged", () => location.reload());
        window.ethereum.on("chainChanged",   () => location.reload());
      }
    } catch (err) {
      console.warn("Wallet connect failed:", err);
      alert("Couldn’t connect wallet. If you have MetaMask, unlock it and try again.");
    }
  };

  // Optional: if no MetaMask, change button label so users know what to do
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("connect-btn");
    if (!btn) return;
    if (!window.ethereum) btn.textContent = "Install MetaMask";
  });
})();
</script>
