/* 7TRB Dashboard JS
   Works with:
   - ethers v6
   - Chart.js
   - Leaflet
*/

const CONFIG = {
  chainIdDecimal: 237422,
  chainIdHex: "0x39f5e", // 237422
  rpcUrl: "https://rpc.alkebuleum.com",
  tokenAddress: "0x991df36e5b0bb596a83dee6a840f78baa40450e0",
  treasuryAddress: "0xdf7ce67db19142672c4193d969cdd9975a5a6038",
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

let browserProvider = null;
let rpcProvider = null;
let signer = null;
let userAddress = null;
let tokenContract = null;
let chartInstance = null;
let mapInstance = null;
let mapMarkersLayer = null;

function el(id) {
  return document.getElementById(id);
}

function safeSetText(id, value) {
  const node = el(id);
  if (node) node.textContent = value;
}

function shortAddress(addr) {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatNumber(value, maxFraction = 2) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined, {
    maximumFractionDigits: maxFraction
  });
}

function setDot(id, color) {
  const node = el(id);
  if (node) node.style.background = color;
}

function setBanner(show, text = "SYSTEM ONLINE — 7TRB DASHBOARD ACTIVE") {
  const banner = el("systemBanner");
  if (!banner) return;
  banner.style.display = show ? "block" : "none";
  banner.textContent = text;
}

async function ensureRpcProvider() {
  if (!rpcProvider) {
    rpcProvider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  }
  return rpcProvider;
}

async function ensureTokenContract(providerLike) {
  if (!tokenContract || tokenContract.runner !== providerLike) {
    tokenContract = new ethers.Contract(CONFIG.tokenAddress, ERC20_ABI, providerLike);
  }
  return tokenContract;
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("No wallet detected. Open this page inside MetaMask or a compatible wallet.");
    return;
  }

  try {
    browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send("eth_requestAccounts", []);
    signer = await browserProvider.getSigner();
    userAddress = await signer.getAddress();

    setDot("walletDot", "#43a047");
    safeSetText("walletBalance", `Wallet Connected: ${userAddress}`);

    const chainHex = await window.ethereum.request({ method: "eth_chainId" });

    if (chainHex.toLowerCase() === CONFIG.chainIdHex.toLowerCase()) {
      setDot("networkDot", "#43a047");
      setBanner(true);
    } else {
      setDot("networkDot", "#fbc02d");
      setBanner(false, "WALLET CONNECTED — WRONG NETWORK");
    }

    await loadWalletData();
  } catch (error) {
    console.error("Wallet connection failed:", error);
    setDot("walletDot", "#e53935");
    safeSetText("walletBalance", "Wallet connection failed.");
  }
}

async function loadWalletData() {
  if (!browserProvider || !userAddress) return;

  try {
    const contract = await ensureTokenContract(browserProvider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch {}

    const tokenBalRaw = await contract.balanceOf(userAddress);
    const tokenBal = ethers.formatUnits(tokenBalRaw, decimals);

    let nativeBalText = "";
    try {
      const nativeBalRaw = await browserProvider.getBalance(userAddress);
      const nativeBal = Number(ethers.formatEther(nativeBalRaw));
      nativeBalText = ` | AKE: ${formatNumber(nativeBal, 4)}`;
    } catch {}

    safeSetText(
      "tokenBalance",
      `${CONFIG.tokenSymbol} Balance: ${formatNumber(tokenBal, 4)}${nativeBalText}`
    );
  } catch (error) {
    console.error("Failed loading wallet data:", error);
    safeSetText("tokenBalance", "Unable to load token balance.");
  }
}

async function loadOnchainStats() {
  try {
    const provider = await ensureRpcProvider();
    const contract = await ensureTokenContract(provider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch {}

    const totalSupplyRaw = await contract.totalSupply();
    const treasuryRaw = await contract.balanceOf(CONFIG.treasuryAddress);

    const totalSupply = Number(ethers.formatUnits(totalSupplyRaw, decimals));
    const treasuryBal = Number(ethers.formatUnits(treasuryRaw, decimals));

    const treasuryPct = totalSupply > 0 ? (treasuryBal / totalSupply) * 100 : 0;

    safeSetText("treasury", formatNumber(treasuryBal, 2));
    if (el("treasuryBar")) el("treasuryBar").style.width = `${Math.min(treasuryPct, 100)}%`;

    safeSetText("tokenContract", CONFIG.tokenAddress);

    if (el("updatedAt")) {
      el("updatedAt").textContent = new Date().toLocaleString();
    }

    setDot("freshDot", "#43a047");
  } catch (error) {
    console.error("On-chain stats error:", error);
    setDot("freshDot", "#fbc02d");
    safeSetText("treasury", "—");
  }
}

async function loadMetricsJson() {
  try {
    const res = await fetch("data/metrics.json", { cache: "no-store" });
    if (!res.ok) throw new Error("metrics.json not found");
    const data = await res.json();

    if (typeof data.holders !== "undefined") {
      safeSetText("holders", formatNumber(data.holders, 0));
      if (el("holdersBar")) {
        const pct = Math.min(Number(data.holders_progress || 0), 100);
        el("holdersBar").style.width = `${pct}%`;
      }
    }

    if (typeof data.active_wallets_30d !== "undefined") {
      safeSetText("active", formatNumber(data.active_wallets_30d, 0));
    }

    if (typeof data.spend_vs_save !== "undefined") {
      safeSetText("spendSave", data.spend_vs_save);
    }

    if (typeof data.spend_progress !== "undefined" && el("spendBar")) {
      el("spendBar").style.width = `${Math.min(Number(data.spend_progress), 100)}%`;
    }

    if (typeof data.referrals_30d !== "undefined") {
      safeSetText("referrals", formatNumber(data.referrals_30d, 0));
    }

    if (Array.isArray(data.treasury_series)) {
      renderTreasuryChart(data.treasury_series);
    }

    if (Array.isArray(data.project_pipeline)) {
      renderProjects(data.project_pipeline);
    }
  } catch (error) {
    console.warn("metrics.json unavailable:", error.message);
    safeSetText("holders", "—");
    safeSetText("active", "—");
    safeSetText("spendSave", "—");
    safeSetText("referrals", "—");
    renderProjects([]);
    renderTreasuryChart([]);
  }
}

function renderTreasuryChart(series) {
  const canvas = el("treasuryChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = series.map(item => item.label || item.date || "");
  const values = series.map(item => Number(item.value || 0));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Treasury",
        data: values,
        borderColor: "#FFD700",
        backgroundColor: "rgba(255,215,0,0.15)",
        tension: 0.25,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#eaeaea" } }
      },
      scales: {
        x: { ticks: { color: "#a1a1a6" }, grid: { color: "#222" } },
        y: { ticks: { color: "#a1a1a6" }, grid: { color: "#222" } }
      }
    }
  });
}

function renderProjects(projectPipeline) {
  const tbody = el("projRows");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!projectPipeline.length) {
    tbody.innerHTML = `<tr><td colspan="2">No project data yet</td></tr>`;
    return;
  }

  for (const item of projectPipeline) {
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
    if (!res.ok) throw new Error("merchants.json not found");
    const merchants = await res.json();

    renderMerchantsTable(merchants);
    renderMerchantMap(merchants);
  } catch (error) {
    console.warn("merchants.json unavailable:", error.message);
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

  merchants.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.name || "—"}</td>
      <td>${m.city || "—"}</td>
      <td>${m.since || "—"}</td>
      <td>${m.monthly_7trb ? formatNumber(m.monthly_7trb, 0) : "—"}</td>
    `;
    tbody.appendChild(tr);
  });
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

async function init() {
  safeSetText("tokenContract", CONFIG.tokenAddress);

  if (el("connectBtn")) {
    el("connectBtn").addEventListener("click", connectWallet);
  }

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
      if (!accounts.length) {
        userAddress = null;
        signer = null;
        setDot("walletDot", "#e53935");
        safeSetText("walletBalance", "Wallet disconnected.");
        safeSetText("tokenBalance", "");
        return;
      }
      userAddress = accounts[0];
      if (browserProvider) signer = await browserProvider.getSigner();
      safeSetText("walletBalance", `Wallet Connected: ${userAddress}`);
      await loadWalletData();
    });

    window.ethereum.on("chainChanged", async () => {
      window.location.reload();
    });
  }

  await Promise.all([
    loadOnchainStats(),
    loadMetricsJson(),
    loadMerchants()
  ]);
}

init();
