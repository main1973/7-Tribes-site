/* Dashboard Nuru surface — uses the shared js/nuru.js client. Public data remains accessible without Nuru. */
(function () {
  "use strict";

  // UNITY PLATFORM: presentation-only environment marker for the shared visual system.
  // It does not change Nuru, chain, balance, or Dashboard state logic.
  if (document.body) document.body.dataset.unityEnv = "technology";

  const ALKE_RPC = "https://rpc.alkebuleum.com";
  let map = null;
  let mapMarkers = null;

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const node = el(id);
    if (node) node.textContent = value;
  }

  function setDot(id, color) {
    const node = el(id);
    if (node) node.style.background = color;
  }

  function setBanner(message) {
    const node = el("systemBanner");
    if (!node) return;
    node.textContent = message || "";
    node.style.display = message ? "block" : "none";
  }

  function formatAddress(address) {
    return address ? address.slice(0, 6) + "…" + address.slice(-4) : "—";
  }

  function updateCopyableAddress(id, address) {
    const node = el(id);
    if (!node) return;
    node.textContent = formatAddress(address);
    node.dataset.address = address || "";
    node.disabled = !address;
    node.title = address ? "Copy " + address : "Address unavailable";
  }

  function balanceText(balance) {
    if (!balance) return "Unavailable";
    if (balance.status === "available") return balance.normalized + " 7TRB";
    if (balance.status === "partial") return "Partial — " + balance.normalized + " 7TRB";
    if (balance.status === "same-address") return "Same as AA Wallet";
    if (balance.status === "wrong-network") return "Switch to Alkebuleum";
    if (balance.status === "idle") return "—";
    return "Unavailable";
  }

  function nativeBalanceText(balance) {
    if (!balance) return "Unavailable";
    if (balance.status === "available") return balance.normalized + " ALKE";
    if (balance.status === "wrong-network") return "Switch to Alkebuleum";
    if (balance.status === "idle") return "—";
    return "Unavailable";
  }

  function updateNuruSurface(state) {
    const connectBtn = el("connectBtn");
    const openNuruBtn = el("openNuruBtn");
    const infoSection = el("nuruInfoSection");
    const onCorrectNetwork = state.onAlkebuleum;

    if (!state.detected) {
      setText("walletBalance", "Open in Nuru to view wallet and identity");
      setText("nuruHandle", "Handle: —");
      setText("nuruAin", "AIN: —");
      if (connectBtn) {
        connectBtn.textContent = "Open in Nuru";
        connectBtn.disabled = false;
      }
      if (openNuruBtn) openNuruBtn.style.display = "none";
      if (infoSection) infoSection.style.display = "none";
      setDot("walletDot", "#666");
      setDot("networkDot", "#666");
      setBanner("Open this dashboard inside Nuru dApp Browser for full wallet identity features.");
      return;
    }

    if (!state.authorized) {
      setText("walletBalance", "Nuru detected — connect to view wallet and identity");
      setText("nuruHandle", "Handle: —");
      setText("nuruAin", "AIN: —");
      if (connectBtn) {
        connectBtn.textContent = "Connect Nuru";
        connectBtn.disabled = false;
      }
      if (openNuruBtn) openNuruBtn.style.display = "none";
      if (infoSection) infoSection.style.display = "none";
      setDot("walletDot", "#ffcc00");
      setDot("networkDot", "#666");
      setBanner("");
      return;
    }

    if (connectBtn) {
      connectBtn.textContent = state.loading ? "Refreshing…" : "Refresh Nuru";
      connectBtn.disabled = state.loading;
    }
    if (openNuruBtn) openNuruBtn.style.display = "none";
    if (infoSection) infoSection.style.display = "grid";

    setText("walletBalance", "Nuru Connected ✓");
    setText("nuruHandle", "Handle: " + (state.primaryHandle || "Unavailable"));
    setText("nuruAin", "AIN: " + (state.ain || "Unavailable"));
    updateCopyableAddress("signerAddress", state.signerAddress);
    updateCopyableAddress("aaWallet", state.aaWallet);
    setText("aaTokenBalance", balanceText(state.aaBalance));
    setText("signerTokenBalance", balanceText(state.signerBalance));
    setText("totalTokenBalance", balanceText(state.totalBalance));
    setText("alkeBalance", nativeBalanceText(state.alkeBalance));
    setText("networkName", onCorrectNetwork ? "Alkebuleum" : "Switch to Alkebuleum to view 7TRB");
    setText("lastRefreshed", state.lastRefreshed ? new Date(state.lastRefreshed).toLocaleString() : "—");
    setText("balanceStatus", state.totalBalance.status === "partial" ? "Partial" : state.totalBalance.status === "available" ? "Live" : state.totalBalance.status === "wrong-network" ? "Wrong network" : "Unavailable");
    setText("verificationStatus", state.ain || state.primaryHandle ? "Nuru identity loaded" : "Identity unavailable");
    setText("reputationScore", "In Development");
    setText("referralRewards", "In Development");

    setDot("walletDot", "#35c759");
    setDot("networkDot", onCorrectNetwork ? "#35c759" : "#ffcc00");
    if (!onCorrectNetwork) {
      setBanner("Switch to Alkebuleum to view 7TRB.");
    } else if (state.totalBalance.status === "partial") {
      setBanner("One 7TRB wallet balance is unavailable. The displayed total is partial.");
    } else if (state.totalBalance.status === "unavailable" && !state.loading) {
      setBanner("7TRB balances are unavailable. No failed contract read is shown as zero.");
    } else {
      setBanner("");
    }
  }

  async function connectOrRefreshNuru() {
    try {
      const state = window.NuruWeb3.getState();
      if (!state.detected) {
        setBanner("Open this dashboard inside Nuru dApp Browser for full wallet identity features.");
        return;
      }
      if (state.authorized) {
        await window.NuruWeb3.refresh();
      } else {
        await window.NuruWeb3.connect();
      }
    } catch (error) {
      setBanner(error && error.message ? error.message : "Unable to connect to Nuru.");
    }
  }

  function bindCopyableAddresses() {
    document.querySelectorAll("[data-copyable-address]").forEach(function (node) {
      node.addEventListener("click", async function () {
        const address = node.dataset.address;
        if (!address || !navigator.clipboard) return;
        try {
          await navigator.clipboard.writeText(address);
          const original = node.textContent;
          node.textContent = "Copied";
          window.setTimeout(function () { node.textContent = original; }, 1000);
        } catch (_) {
          setBanner("Copy unavailable in this browser. Address: " + address);
        }
      });
    });
  }

  async function loadPublicChainData() {
    try {
      const response = await fetch(ALKE_RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] })
      });
      const payload = await response.json();
      if (!payload || !payload.result) throw new Error("No block number returned");
      setText("blockNumber", Number.parseInt(payload.result, 16).toLocaleString());
      setText("updatedAt", new Date().toLocaleString());
      setDot("freshDot", "#35c759");
    } catch (_) {
      setText("blockNumber", "Unavailable");
      setText("updatedAt", "—");
      setDot("freshDot", "#ff453a");
    }
  }

  function setPendingMetrics() {
    setText("holders", "Unavailable");
    setText("active", "In Development");
    setText("treasury", "In Development");
    setText("referrals", "In Development");
    const holdersBar = el("holdersBar");
    const treasuryBar = el("treasuryBar");
    if (holdersBar) holdersBar.style.width = "0%";
    if (treasuryBar) treasuryBar.style.width = "0%";
  }

  async function loadMerchants() {
    try {
      const response = await fetch("data/merchants.json", { cache: "no-store" });
      if (!response.ok) throw new Error("merchants.json missing");
      const merchants = await response.json();
      renderMerchantTable(merchants);
      renderMerchantMap(merchants);
    } catch (_) {
      renderMerchantTable([]);
      renderMerchantMap([]);
    }
  }

  function renderMerchantTable(merchants) {
    const tbody = el("merchRows");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!merchants.length) {
      tbody.innerHTML = "<tr><td colspan=\"4\">Merchant data unavailable</td></tr>";
      return;
    }
    merchants.forEach(function (merchant) {
      const row = document.createElement("tr");
      row.innerHTML = "<td>" + (merchant.name || "—") + "</td><td>" + (merchant.city || "—") + "</td><td>" + (merchant.since || "—") + "</td><td>" + (merchant.monthly_7trb || "—") + "</td>";
      tbody.appendChild(row);
    });
  }

  function renderMerchantMap(merchants) {
    const mapNode = el("map");
    if (!mapNode || typeof window.L === "undefined") return;
    const withCoordinates = merchants.filter(function (merchant) {
      return typeof merchant.lat === "number" && typeof merchant.lng === "number";
    });
    if (!map) {
      map = window.L.map("map").setView([42.3314, -83.0458], 3);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
      mapMarkers = window.L.layerGroup().addTo(map);
    }
    mapMarkers.clearLayers();
    if (!withCoordinates.length) return;
    withCoordinates.forEach(function (merchant) {
      window.L.marker([merchant.lat, merchant.lng]).bindPopup("<strong>" + merchant.name + "</strong><br>" + (merchant.city || "")).addTo(mapMarkers);
    });
    map.fitBounds(window.L.latLngBounds(withCoordinates.map(function (merchant) { return [merchant.lat, merchant.lng]; })), { padding: [20, 20] });
  }

  function bindUi() {
    const connectButton = el("connectBtn");
    if (connectButton) connectButton.addEventListener("click", connectOrRefreshNuru);
    bindCopyableAddresses();
  }

  async function init() {
    bindUi();
    window.NuruWeb3.subscribe(updateNuruSurface);
    setPendingMetrics();
    await Promise.all([loadPublicChainData(), loadMerchants()]);
    await window.NuruWeb3.initialize();
  }

  init();
})();
