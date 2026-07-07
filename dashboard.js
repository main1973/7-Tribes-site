/* 7TRB Dashboard JS — Nuru Integration */

const CONFIG = {
  rpcUrl: "https://rpc.alkebuleum.com",
  chainIdHex: "0x39f6e",
  chainIdDecimal: 237422,
  tokenAddress: "0xdf7ce67dB19142672c4193d969cdD9975A5A6038",
  aleTokenAddress: "0x0000000000000000000000000000000000000000", // Placeholder - update with actual ALE address
  trackedWallet: "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB",
  treasuryAddress: "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB",
  tokenSymbol: "7TRB",
  aleSymbol: "ALKE",
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
let aaWallet = null;
let nuruHandle = null;
let nuruAin = null;
let treasuryChart = null;
let map = null;
let mapMarkers = null;
let isNuruBrowser = false;

function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = el(id);
  if (node) node.textContent = value;
}

function setBanner(message) {
  const node = el("systemBanner");
  if (node) {
    node.style.display = "block";
    node.textContent = message;
  }
}

function setDot(id, color) {
  const node = el(id);
  if (node) node.style.background = color;
}

function formatNumber(value, maxFraction = 2) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: maxFraction
  });
}

function formatAddress(addr) {
  if (!addr) return "—";
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
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

async function getAleContract(providerLike) {
  return new ethers.Contract(CONFIG.aleTokenAddress, ERC20_ABI, providerLike);
}

function detectNuru() {
  if (window.ethereum && window.ethereum._isNuruWallet === true) {
    isNuruBrowser = true;
    return true;
  }
  return false;
}

async function checkExistingConnection() {
  if (!window.ethereum) {
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length > 0) {
      // Silent connection
      await connectNuru(true);
      return true;
    }
  } catch (error) {
    console.warn("Failed to check existing connection:", error);
  }
  return false;
}

async function connectNuru(silent = false) {
  if (!window.ethereum) {
    if (!silent) {
      setBanner("Open this dashboard inside Nuru dApp Browser for full wallet identity features.");
    }
    return false;
  }

  try {
    // Detect Nuru
    if (!detectNuru()) {
      if (!silent) {
        setBanner("Open this dashboard inside Nuru dApp Browser for full wallet identity features.");
      }
      return false;
    }

    // Request accounts
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
      if (!silent) {
        setText("walletBalance", "No Account");
        setDot("walletDot", "#ff453a");
      }
      return false;
    }

    connectedAddress = accounts[0];
    browserProvider = new ethers.BrowserProvider(window.ethereum);
    signer = await browserProvider.getSigner();

    // Get Nuru identity
    try {
      const identity = await window.ethereum.request({ method: "nuru_getIdentity" });
      if (identity) {
        nuruHandle = identity.primaryHandle || null;
        nuruAin = identity.ain || null;
        aaWallet = identity.aaWallet || null;
      }
    } catch (error) {
      console.warn("Failed to get Nuru identity:", error);
    }

    // Check network
    const chainHex = await window.ethereum.request({ method: "eth_chainId" });

    // Update UI
    setText("walletBalance", "Connected via Nuru ✓");
    setText("nuruHandle", `Handle: ${nuruHandle || "—"}`);
    setText("nuruAin", `AIN: ${nuruAin || "—"}`);
    setText("signerAddress", formatAddress(connectedAddress));
    setText("aaWallet", formatAddress(aaWallet));
    
    setDot("walletDot", "#35c759");

    // Show Nuru info section
    const nuruSection = el("nuruInfoSection");
    if (nuruSection) nuruSection.style.display = "grid";

    if (chainHex.toLowerCase() === CONFIG.chainIdHex.toLowerCase()) {
      setDot("networkDot", "#35c759");
      if (!silent) {
        setBanner("Connected to Nuru on Alkebuleum.");
      }
    } else {
      setDot("networkDot", "#ffcc00");
      if (!silent) {
        setBanner("Connected to Nuru, but wrong network. Switch to Alkebuleum.");
      }
    }

    // Load balances using AA wallet
    await loadBalances();

    // Set up event listeners
    setupEventListeners();

    return true;
  } catch (error) {
    console.error("Nuru connection failed:", error);
    if (!silent) {
      setText("walletBalance", "Connection Failed");
      setBanner("Failed to connect to Nuru. Try again.");
      setDot("walletDot", "#ff453a");
    }
    return false;
  }
}

async function loadBalances() {
  try {
    const balanceAddress = aaWallet || connectedAddress;
    const contract = await getTokenContract(browserProvider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch {}

    const rawBalance = await contract.balanceOf(balanceAddress);
    const formatted = ethers.formatUnits(rawBalance, decimals);

    setText("tokenBalance", `${formatNumber(formatted, 4)} ${CONFIG.tokenSymbol}`);

    // Try to load ALE balance if address is available
    if (CONFIG.aleTokenAddress !== "0x0000000000000000000000000000000000000000") {
      try {
        const aleContract = await getAleContract(browserProvider);
        const aleDecimals = await aleContract.decimals();
        const aleRaw = await aleContract.balanceOf(balanceAddress);
        const aleFormatted = ethers.formatUnits(aleRaw, aleDecimals);
        setText("aleBalance", `${formatNumber(aleFormatted, 4)} ${CONFIG.aleSymbol}`);
      } catch {
        setText("aleBalance", "—");
      }
    } else {
      setText("aleBalance", "—");
    }

    // Placeholder values
    setText("verificationStatus", "Verified");
    setText("reputationScore", "—");
    setText("referralRewards", "—");
  } catch (error) {
    console.error("Failed to load balances:", error);
    setText("tokenBalance", "—");
    setText("aleBalance", "—");
  }
}

function setupEventListeners() {
  if (!window.ethereum) return;

  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else if (accounts[0] !== connectedAddress) {
      connectedAddress = accounts[0];
      connectNuru(true);
    }
  });

  window.ethereum.on("nuruIdentityChanged", () => {
    connectNuru(true);
  });

  window.ethereum.on("disconnect", () => {
    handleDisconnect();
  });
}

function handleDisconnect() {
  connectedAddress = null;
  aaWallet = null;
  nuruHandle = null;
  nuruAin = null;
  browserProvider = null;
  signer = null;

  setText("walletBalance", "Not Connected");
  setText("nuruHandle", "Handle: —");
  setText("nuruAin", "AIN: —");
  setText("signerAddress", "—");
  setText("aaWallet", "—");
  setText("tokenBalance", "—");
  setText("aleBalance", "—");

  const nuruSection = el("nuruInfoSection");
  if (nuruSection) nuruSection.style.display = "none";

  setDot("walletDot", "#666");
  
  const connectBtn = el("connectBtn");
  if (connectBtn) {
    connectBtn.textContent = "Sign in with Nuru";
    connectBtn.style.display = "inline-flex";
  }
}

function openNuru() {
  if (isNuruBrowser) {
    window.location.reload();
  } else {
    setBanner("Open this dashboard inside Nuru dApp Browser.");
  }
}

async function loadReadOnlyTokenData() {
  try {
    const provider = await getRpcProvider();
    const contract = await getTokenContract(provider);

    let decimals = CONFIG.tokenDecimalsFallback;
    try {
      decimals = await contract.decimals();
    } catch {}

    const [walletRaw, treasuryRaw, totalSupplyRaw, block] = await Promise.all([
      contract.balanceOf(CONFIG.trackedWallet),
      contract.balanceOf(CONFIG.treasuryAddress),
      contract.totalSupply(),
      provider.getBlockNumber()
    ]);

    const walletBalance = Number(ethers.formatUnits(walletRaw, decimals));
    const treasuryBalance = Number(ethers.formatUnits(treasuryRaw, decimals));
    const totalSupply = Number(ethers.formatUnits(totalSupplyRaw, decimals));

    setText("treasury", formatNumber(treasuryBalance, 0));
    setText("blockNumber", block.toString());
    setText("updatedAt", new Date().toLocaleString());

    const treasuryPct = totalSupply > 0 ? (treasuryBalance / totalSupply) * 100 : 0;
    const treasuryBar = el("treasuryBar");
    if (treasuryBar) treasuryBar.style.width = `${Math.min(treasuryPct, 100)}%`;

    setDot("freshDot", "#35c759");
    if (!connectedAddress) {
      setDot("networkDot", "#35c759");
    }

    renderChart([
      { label: "Launch", value: totalSupply },
      { label: "Treasury", value: treasuryBalance }
    ]);
  } catch (error) {
    console.error("Read-only token load failed:", error);
    setText("treasury", "Unavailable");
    setText("blockNumber", "—");
    setText("updatedAt", "—");
    setDot("freshDot", "#ff453a");
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

    if (el("holdersBar") && typeof data.holders_progress !== "undefined") {
      el("holdersBar").style.width = `${Math.min(Number(data.holders_progress), 100)}%`;
    }

    if (Array.isArray(data.treasury_series) && data.treasury_series.length) {
      renderChart(data.treasury_series);
    }
  } catch (error) {
    console.warn("Metrics load failed:", error.message);
    setText("holders", "1");
    setText("active", "1");
    setText("referrals", "0");
    if (el("holdersBar")) el("holdersBar").style.width = "10%";
  }
}

function renderChart(series) {
  const canvas = el("treasuryChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = series.map(item => item.label);
  const values = series.map(item => Number(item.value || 0));

  if (treasuryChart) treasuryChart.destroy();

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
    renderMerchantTable(merchants);
    renderMerchantMap(merchants);
  } catch (error) {
    console.warn("Merchants load failed:", error.message);
    renderMerchantTable([
      { name: "Mainhouse Apparel", city: "Detroit", since: "2026", monthly_7trb: "—" },
      { name: "7Tribes Digital", city: "Online", since: "2026", monthly_7trb: "—" }
    ]);
    renderMerchantMap([]);
  }
}

function renderMerchantTable(merchants) {
  const tbody = el("merchRows");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!merchants.length) {
    tbody.innerHTML = `<tr><td colspan="4">No merchants yet</td></tr>`;
    return;
  }

  merchants.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.name || "—"}</td>
      <td>${m.city || "—"}</td>
      <td>${m.since || "—"}</td>
      <td>${m.monthly_7trb || "—"}</td>
    `;
    tbody.appendChild(tr);
  });
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
  if (connectBtn) connectBtn.addEventListener("click", () => connectNuru(false));

  const openBtn = el("openNuruBtn");
  if (openBtn) openBtn.addEventListener("click", openNuru);
}

async function init() {
  bindUi();
  
  // Check if Nuru is available
  detectNuru();
  
  // Try to check for existing connection
  const hasConnection = await checkExistingConnection();
  
  // If not inside Nuru browser, show message
  if (!isNuruBrowser) {
    setBanner("Open this dashboard inside Nuru dApp Browser for full wallet identity features.");
  }
  
  // Load read-only data regardless of connection
  await loadReadOnlyTokenData();
  await loadMetrics();
  await loadMerchants();
}

init();
