/* 7TRB Ecosystem Dashboard: public visibility with verified technical data only. */
(function () {
  "use strict";

  const ALKE_RPC = "https://rpc.alkebuleum.com";
  const CONTRACT_ADDRESS = "0x991df36e5b0bb596a83dee6a840f78bAa40450e0";

  function byId(id) { return document.getElementById(id); }
  function setText(id, value) { const node = byId(id); if (node) node.textContent = value; }

  async function loadBlockHeight() {
    try {
      const response = await fetch(ALKE_RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] })
      });
      const payload = await response.json();
      if (!response.ok || !payload || !payload.result) throw new Error("No block number returned");
      setText("blockNumber", Number.parseInt(payload.result, 16).toLocaleString());
      setText("blockStatus", "Live Alkebuleum RPC response.");
    } catch (_) {
      setText("blockNumber", "Unavailable");
      setText("blockStatus", "Live block data is temporarily unavailable. No substitute value is shown.");
    }
  }

  function bindCopyContract() {
    const button = byId("copyContract");
    if (!button) return;
    button.addEventListener("click", async function () {
      try {
        if (!navigator.clipboard) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(CONTRACT_ADDRESS);
        const original = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(function () { button.textContent = original; }, 1200);
      } catch (_) {
        button.textContent = "Copy unavailable";
      }
    });
  }

  function init() {
    if (document.body) document.body.dataset.unityEnv = "technology";
    bindCopyContract();
    loadBlockHeight();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
