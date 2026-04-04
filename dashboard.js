/* 7TRB Dashboard JS
   Matches simplified transparency dashboard.html
   - Read-only data from Alkebuleum RPC
   - AmVault-first wallet connect flow
   - Loads optional metrics.json and merchants.json
*/

const CONFIG = {
  rpcUrl: "https://rpc.alkebuleum.com",
  chainIdHex: "0x39f5e",
  amvaultUrl: "https://amvault.net",
  tokenAddress: "0x991df36e5b0bb596a83dee6a840f78baa40450e0",
  trackedWallet: "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB",
  treasuryAddress: "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB",
  tokenSymbol: "7TRB",
  tokenDecimalsFallback: 18
};

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
];

let rpcProvider = null;
let browserProvider = null;
let signer = null;
let connectedAddress = null;
let treasuryChart = null;
let map = null;
let mapMarkers = null;

function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = el(id);
  if (node) node.textContent = value;
}

function setBanner(message) {
  const node = el("systemBanner");
  if (node) node.textContent = message;
}

function formatNumber(value, maxFraction = 2) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined, {
    maximumFractionDigits: maxFraction
  });
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

async function connectWallet() {
  if (!window.ethereum) {
    setBanner("Open AmVault in a new tab, then return here.");
    window.open(CONFIG.amvaultUrl, "_blank");
    return;
  }

  try {
    browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send("eth_requestAccounts", []);
    signer = await browserProvider.getSigner();
    connectedAddress = await signer.getAddress();

    setText("walletBalance", "Connected");

    const contract = await getTokenContract(browserProvider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch (err) {
      console.warn("Could not read decimals, using fallback.");
    }

    const rawBalance = await contract.balanceOf(connectedAddress);
    const formatted = ethers.formatUnits(rawBalance, decimals);

    setText("tokenBalance", `${CONFIG.tokenSymbol} Balance: ${formatNumber(formatted, 4)}`);
    setBanner("Wallet connected inside AmVault.");
  } catch (error) {
    console.error("Wallet connection failed:", error);
    setText("walletBalance", "Connection Failed");
    setBanner("Wallet connection failed. Try again inside AmVault.");
  }
}

async function loadReadOnlyTokenData() {
  try {
    const provider = await getRpcProvider();
    const contract = await getTokenContract(provider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch (err) {
      console.warn("Could not read decimals, using fallback.");
    }

    const [walletRaw, treasuryRaw, totalSupplyRaw] = await Promise.all([
      contract.balanceOf(CONFIG.trackedWallet),
      contract.balanceOf(CONFIG.treasuryAddress),
      contract.totalSupply()
    ]);

    const walletBalance = Number(ethers.formatUnits(walletRaw, decimals));
    const treasuryBalance = Number(ethers.formatUnits(treasuryRaw, decimals));
    const totalSupply = Number(ethers.formatUnits(totalSupplyRaw, decimals));

    setText("walletBalance", "Not Connected");
    setText("tokenBalance", `${CONFIG.tokenSymbol} Balance: ${formatNumber(walletBalance, 4)}`);
    setText("treasury", formatNumber(treasuryBalance, 0));

    const treasuryPct = totalSupply > 0 ? (treasuryBalance / totalSupply) * 100 : 0;
    const treasuryBar = el("treasuryBar");
    if (treasuryBar) treasuryBar.style.width = `${Math.min(treasuryPct, 100)}%`;

    renderChart([
      { label: "Launch", value: totalSupply },
      { label: "Treasury", value: treasuryBalance }
    ]);
  } catch (error) {
    console.error("Read-only token load failed:", error);
    setText("tokenBalance", `${CONFIG.tokenSymbol} Balance: unavailable`);
    setText("treasury", "Unavailable");
  }
}

async function loadMetrics() {
  try {
    const res = await fetch("data/metrics.json", { cache: "no-store" });
    if (!res.ok) throw new Error("metrics.json missing");

    const data = await res.json();

    setText("holders", data.holders ?? "—");
    setText("active", data.active_wallets_30d ?? "—");
    setText("referrals", data.referrals_30d ?? "—");

    if (Array.isArray(data.treasury_series) && data.treasury_series.length) {
      renderChart(data.treasury_series);
    }
  } catch (error) {
    console.warn("Metrics load failed:", error.message);
    if (!el("holders")?.textContent || el("holders").textContent === "—") {
      setText("holders", "1");
    }
    if (!el("active")?.textContent || el("active").textContent === "—") {
      setText("active", "1");
    }
    if (!el("referrals")?.textContent || el("referrals").textContent === "—") {
      setText("referrals", "0");
    }
  }
}

function renderChart(series) {
  const canvas = el("treasuryChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = series.map(item => item.label);
  const values = series.map(item => Number(item.value || 0));

  if (treasuryChart) {
    treasuryChart.destroy();
  }

  treasuryChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Treasury",
        data: values,
        borderColor: "#FFD700",
        backgroundColor: "rgba(255,215,0,0.1)",
        fill: true,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#FFD700" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#aaa" },
          grid: { color: "#222" }
        },
        y: {
          ticks: { color: "#aaa" },
          grid: { color: "#222" }
        }
      }
    }
  });
}

async function loadMerchants() {
  try {
    const res = await fetch("data/merchants.json", { cache: "no-store" });
    if (!res.ok) throw new Error("merchants.json missing");

    const merchants = await res.json();
    renderMerchantList(merchants);
    renderMerchantMap(merchants);
  } catch (error) {
    console.warn("Merchants load failed:", error.message);
    const fallback = [
      { name: "Mainhouse Apparel", city: "Detroit" },
      { name: "7Tribes Digital", city: "Online" }
    ];
    renderMerchantList(fallback);
    renderMerchantMap([]);
  }
}

function renderMerchantList(merchants) {
  const container = el("merchants");
  if (!container) return;

  if (!merchants.length) {
    container.textContent = "No merchants yet";
    return;
  }

  container.innerHTML = merchants.map(m => {
    const city = m.city ? ` — ${m.city}` : "";
    return `<div style="padding:8px 0;border-bottom:1px solid #222;">${m.name}${city}</div>`;
  }).join("");
}

function renderMerchantMap(merchants) {
  const mapNode = el("map");
  if (!mapNode || typeof L === "undefined") return;

  const withCoords = merchants.filter(
    m => typeof m.lat === "number" && typeof m.lng === "number"
  );

  if (!map) {
    map = L.map("map").setView([42.3314, -83.0458], 3);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    mapMarkers = L.layerGroup().addTo(map);
  }

  mapMarkers.clearLayers();

  if (!withCoords.length) return;

  withCoords.forEach(m => {
    L.marker([m.lat, m.lng])
      .bindPopup(`<strong>${m.name}</strong><br>${m.city || ""}`)
      .addTo(mapMarkers);
  });

  const bounds = L.latLngBounds(withCoords.map(m => [m.lat, m.lng]));
  map.fitBounds(bounds, { padding: [20, 20] });
}

function bindUi() {
  const connectBtn = el("connectBtn");
  if (connectBtn) {
    connectBtn.addEventListener("click", connectWallet);
  }
}

async function init() {
  bindUi();
  await loadReadOnlyTokenData();
  await loadMetrics();
  await loadMerchants();
}

init();
