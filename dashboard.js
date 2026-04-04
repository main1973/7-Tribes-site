/* 7TRB Dashboard — AmVault-first flow
   - Read-only mode works from normal browser
   - Wallet connect works when opened inside AmVault (or any injected EVM wallet)
   - Redirect/fallback button opens amvault.net
   - ethers v6 required
*/

const CONFIG = {
  chainIdDecimal: 237422,
  chainIdHex: "0x39f5e",
  rpcUrl: "https://rpc.alkebuleum.com",
  tokenAddress: "0x991df36e5b0bb596a83dee6a840f78baa40450e0",
  trackedWallet: "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB",
  treasuryAddress: "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB", // change later if treasury is separate
  amvaultUrl: "https://amvault.net",
  tokenSymbol: "7TRB",
  tokenDecimalsFallback: 18
};

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
];

let rpcProvider = null;
let browserProvider = null;
let signer = null;
let connectedAddress = null;
let chartInstance = null;
let mapInstance = null;
let mapMarkersLayer = null;

function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = el(id);
  if (node) node.textContent = value;
}

function setHTML(id, value) {
  const node = el(id);
  if (node) node.innerHTML = value;
}

function setDot(id, color) {
  const node = el(id);
  if (node) node.style.background = color;
}

function shortAddress(addr) {
  if (!addr || addr.length < 12) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatNumber(value, maxFraction = 2) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: maxFraction
  });
}

function showBanner(message, good = true) {
  const banner = el("systemBanner");
  if (!banner) return;
  banner.style.display = "block";
  banner.textContent = message;
  banner.style.color = good ? "#35c759" : "#ffcc00";
  banner.style.background = good
    ? "rgba(53,199,89,.12)"
    : "rgba(255,204,0,.12)";
  banner.style.borderBottom = good
    ? "1px solid rgba(53,199,89,.35)"
    : "1px solid rgba(255,204,0,.35)";
}

async function getRpcProvider() {
  if (!rpcProvider) {
    rpcProvider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  }
  return rpcProvider;
}

async function getTokenContract(providerLike) {
  return new ethers.Contract(CONFIG.tokenAddress, ERC20_ABI, providerLike);
}

async function loadReadOnlyData() {
  try {
    const provider = await getRpcProvider();
    const contract = await getTokenContract(provider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch {}

    const [totalSupplyRaw, trackedRaw, treasuryRaw, block] = await Promise.all([
      contract.totalSupply(),
      contract.balanceOf(CONFIG.trackedWallet),
      contract.balanceOf(CONFIG.treasuryAddress),
      provider.getBlockNumber()
    ]);

    const totalSupply = ethers.formatUnits(totalSupplyRaw, decimals);
    const trackedBal = ethers.formatUnits(trackedRaw, decimals);
    const treasuryBal = ethers.formatUnits(treasuryRaw, decimals);

    setText("tokenContract", CONFIG.tokenAddress);
    setText("walletBalance", `Tracked Wallet: ${CONFIG.trackedWallet}`);
    setText("tokenBalance", `${CONFIG.tokenSymbol} Balance: ${formatNumber(trackedBal, 4)}`);
    setText("treasury", formatNumber(treasuryBal, 4));
    setText("holders", "—");
    setText("active", "—");
    setText("spendSave", "Live");
    setText("referrals", "—");
    setText("updatedAt", new Date().toLocaleString());
    setText("blockNumber", block.toString());

    const treasuryPct = Number(totalSupply) > 0
      ? (Number(treasuryBal) / Number(totalSupply)) * 100
      : 0;

    if (el("treasuryBar")) el("treasuryBar").style.width = `${Math.min(treasuryPct, 100)}%`;
    if (el("holdersBar")) el("holdersBar").style.width = `0%`;
    if (el("spendBar")) el("spendBar").style.width = `100%`;

    setDot("freshDot", "#35c759");
    setDot("networkDot", "#35c759");

    renderTreasuryChart([
      { label: "Supply", value: Number(totalSupply) || 0 },
      { label: "Wallet", value: Number(trackedBal) || 0 },
      { label: "Treasury", value: Number(treasuryBal) || 0 }
    ]);

    showBanner("READ-ONLY MODE ACTIVE — OPEN IN AMVAULT TO CONNECT WALLET", false);
  } catch (err) {
    console.error("Read-only load failed:", err);
    setDot("freshDot", "#ff453a");
    setDot("networkDot", "#ff453a");
    showBanner("RPC UNAVAILABLE — CHECK ALKEBULEUM CONNECTION", false);
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showBanner("NO INJECTED WALLET DETECTED — OPEN THIS DASHBOARD IN AMVAULT", false);
    window.location.href = CONFIG.amvaultUrl;
    return;
  }

  try {
    browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send("eth_requestAccounts", []);
    signer = await browserProvider.getSigner();
    connectedAddress = await signer.getAddress();

    const chainHex = await window.ethereum.request({ method: "eth_chainId" });

    setText("walletBalance", `Connected Wallet: ${connectedAddress}`);
    setDot("walletDot", "#35c759");

    if (chainHex.toLowerCase() === CONFIG.chainIdHex.toLowerCase()) {
      setDot("networkDot", "#35c759");
      showBanner("AMVAULT CONNECTED — 7TRB DASHBOARD LIVE");
    } else {
      setDot("networkDot", "#ffcc00");
      showBanner("WALLET CONNECTED — WRONG NETWORK SELECTED", false);
    }

    await loadConnectedWalletData();
  } catch (err) {
    console.error("Connect failed:", err);
    setDot("walletDot", "#ff453a");
    showBanner("WALLET CONNECTION FAILED", false);
  }
}

async function loadConnectedWalletData() {
  if (!browserProvider || !connectedAddress) return;

  try {
    const contract = await getTokenContract(browserProvider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch {}

    const [tokenBalRaw, nativeBalRaw] = await Promise.all([
      contract.balanceOf(connectedAddress),
      browserProvider.getBalance(connectedAddress)
    ]);

    const tokenBal = ethers.formatUnits(tokenBalRaw, decimals);
    const nativeBal = ethers.formatEther(nativeBalRaw);

    setText(
      "tokenBalance",
      `${CONFIG.tokenSymbol} Balance: ${formatNumber(tokenBal, 4)} | ALKE: ${formatNumber(nativeBal, 6)}`
    );
  } catch (err) {
    console.error("Connected wallet load failed:", err);
    setText("tokenBalance", "Unable to load connected wallet balance.");
  }
}

function openAmVault() {
  window.location.href = CONFIG.amvaultUrl;
}

function renderTreasuryChart(series) {
  const canvas = el("treasuryChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = series.map(x => x.label);
  const values = series.map(x => x.value);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "7TRB",
        data: values,
        backgroundColor: [
          "rgba(255,215,0,0.85)",
          "rgba(255,215,0,0.65)",
          "rgba(255,215,0,0.45)"
        ],
        borderColor: [
          "rgba(255,215,0,1)",
          "rgba(255,215,0,1)",
          "rgba(255,215,0,1)"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#f3f3f3" } }
      },
      scales: {
        x: {
          ticks: { color: "#b0b0b0" },
          grid: { color: "#222" }
        },
        y: {
          ticks: { color: "#b0b0b0" },
          grid: { color: "#222" }
        }
      }
    }
  });
}

async function loadOptionalFiles() {
  await Promise.all([
    loadMetricsJson(),
    loadMerchants()
  ]);
}

async function loadMetricsJson() {
  try {
    const res = await fetch("data/metrics.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No metrics.json");
    const data = await res.json();

    if (typeof data.holders !== "undefined") setText("holders", formatNumber(data.holders, 0));
    if (typeof data.active_wallets_30d !== "undefined") setText("active", formatNumber(data.active_wallets_30d, 0));
    if (typeof data.spend_vs_save !== "undefined") setText("spendSave", data.spend_vs_save);
    if (typeof data.referrals_30d !== "undefined") setText("referrals", formatNumber(data.referrals_30d, 0));

    if (typeof data.holders_progress !== "undefined" && el("holdersBar")) {
      el("holdersBar").style.width = `${Math.min(Number(data.holders_progress), 100)}%`;
    }
    if (typeof data.spend_progress !== "undefined" && el("spendBar")) {
      el("spendBar").style.width = `${Math.min(Number(data.spend_progress), 100)}%`;
    }

    if (Array.isArray(data.project_pipeline)) {
      renderProjects(data.project_pipeline);
    }
    if (Array.isArray(data.treasury_series) && data.treasury_series.length) {
      renderLineChart(data.treasury_series);
    }
  } catch {
    renderProjects([]);
  }
}

function renderLineChart(series) {
  const canvas = el("treasuryChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = series.map(x => x.label || x.date || "");
  const values = series.map(x => Number(x.value || 0));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Treasury",
        data: values,
        borderColor: "#ffd700",
        backgroundColor: "rgba(255,215,0,0.14)",
        fill: true,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#f3f3f3" } }
      },
      scales: {
        x: { ticks: { color: "#b0b0b0" }, grid: { color: "#222" } },
        y: { ticks: { color: "#b0b0b0" }, grid: { color: "#222" } }
      }
    }
  });
}

function renderProjects(items) {
  const tbody = el("projRows");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="2">No project data yet</td></tr>`;
    return;
  }

  for (const item of items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.status || "—"}</td>
      <td>${formatNumber(item.count || 0, 0)}</td>
    `;
    tbody.appendChild(tr);
  }
}

async function loadMerchants() {
  try {
    const res = await fetch("data/merchants.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No merchants.json");
    const merchants = await res.json();
    renderMerchantsTable(merchants);
    renderMerchantMap(merchants);
  } catch {
    renderMerchantsTable([]);
    renderMerchantMap([]);
  }
}

function renderMerchantsTable(merchants) {
  const tbody = el("merchRows");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!merchants.length) {
    tbody.innerHTML = `<tr><td colspan="4">No merchants added yet</td></tr>`;
    return;
  }

  for (const m of merchants) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.name || "—"}</td>
      <td>${m.city || "—"}</td>
      <td>${m.since || "—"}</td>
      <td>${m.monthly_7trb ? formatNumber(m.monthly_7trb, 0) : "—"}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderMerchantMap(merchants) {
  const mapNode = el("map");
  if (!mapNode || typeof L === "undefined") return;

  const withCoords = merchants.filter(m => typeof m.lat === "number" && typeof m.lng === "number");

  if (!mapInstance) {
    mapInstance = L.map("map").setView([7.9465, -1.0232], 3);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(mapInstance);
    mapMarkersLayer = L.layerGroup().addTo(mapInstance);
  }

  mapMarkersLayer.clearLayers();

  if (!withCoords.length) return;

  withCoords.forEach(m => {
    L.marker([m.lat, m.lng])
      .bindPopup(`<b>${m.name || "Merchant"}</b><br>${m.city || ""}`)
      .addTo(mapMarkersLayer);
  });

  const bounds = L.latLngBounds(withCoords.map(m => [m.lat, m.lng]));
  mapInstance.fitBounds(bounds, { padding: [20, 20] });
}

function bindUi() {
  const connectBtn = el("connectBtn");
  if (connectBtn) connectBtn.addEventListener("click", connectWallet);

  const openBtn = el("openAmVaultBtn");
  if (openBtn) openBtn.addEventListener("click", openAmVault);

  if (window.ethereum) {
    setDot("walletDot", "#ffcc00");

    window.ethereum.on("accountsChanged", async (accounts) => {
      if (!accounts.length) {
        connectedAddress = null;
        signer = null;
        setDot("walletDot", "#ff453a");
        setText("walletBalance", `Tracked Wallet: ${CONFIG.trackedWallet}`);
        setText("tokenBalance", `${CONFIG.tokenSymbol} Balance: loading...`);
        return;
      }
      connectedAddress = accounts[0];
      if (browserProvider) signer = await browserProvider.getSigner();
      setText("walletBalance", `Connected Wallet: ${connectedAddress}`);
      await loadConnectedWalletData();
    });

    window.ethereum.on("chainChanged", () => window.location.reload());
  } else {
    setDot("walletDot", "#ffcc00");
  }
}

async function init() {
  bindUi();
  await loadReadOnlyData();
  await loadOptionalFiles();

  if (!window.ethereum) {
    setHTML(
      "tokenBalance",
      `${CONFIG.tokenSymbol} Balance: loading... <br><small>Open this dashboard inside AmVault to connect your wallet.</small>`
    );
  }
}

init();
