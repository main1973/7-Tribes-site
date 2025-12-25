// ----------------------------
// 7TRB Dashboard Logic
// ----------------------------

// Alkebuleum config
const ALKE_RPC       = "https://rpc.alkebuleum.com";
const TOKEN_ADDRESS  = "0xdf7ce67dB19142672c4193d969cdD9975A5A6038"; // 7TRB on Alkebuleum
const TOKEN_DECIMALS = 18;
const TOKEN_SYMBOL   = "7TRB";

// AmVault treasury on Alkebuleum
const TREASURY_WALLET = "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB";

// ---------- helpers ----------
async function safeJson(url){
  try{
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) throw new Error(`${url}: ${res.status}`);
    return res.json();
  }catch(err){
    console.warn("Fetch failed:", url, err);
    return null;
  }
}

const pct = (v, g) => {
  if(!g) return 0;
  const d = g.stretch || g.goal || 1;
  return Math.max(0, Math.min(100, Math.round((v / d) * 100)));
};

const setBar = (id, p) => {
  const el = document.getElementById(id);
  if(el) el.style.width = p + "%";
};

function setText(id, txt){
  const el = document.getElementById(id);
  if(el) el.textContent = txt;
}

// ---------- metrics + tables ----------
(async function initDashboard(){
  const [goals, metrics, merchants, referrals] = await Promise.all([
    safeJson("data/goals.json"),
    safeJson("data/metrics.json"),
    safeJson("data/merchants.json"),
    safeJson("data/referrals.json")
  ]);

  if(!metrics){
    setText("updatedAt", "— (awaiting data/metrics.json)");
    return;
  }

  // timestamp / freshness
  const upd = metrics.updated_at ? new Date(metrics.updated_at) : null;
  setText("updatedAt", (upd && !isNaN(upd)) ? upd.toLocaleString() : "—");

  const freshDot = document.getElementById("freshDot");
  if (freshDot && upd && !isNaN(upd)){
    const hrs = (Date.now() - upd.getTime()) / 36e5;
    freshDot.style.background = hrs <= 24 ? "#22c55e" : (hrs <= 72 ? "#f59e0b" : "#ef4444");
    freshDot.title = `Data age: ${hrs.toFixed(1)}h`;
  }

  // KPIs
  const holders = metrics.holders ?? 0;
  setText("holders", holders.toLocaleString());
  setBar("holdersBar", pct(holders, goals && goals.holders));

  const active = metrics.active_wallets_30d ?? 0;
  setText("active", active.toLocaleString());

  const tUSD = Math.round(metrics.treasury_usd ?? 0);
  setText("treasury", "$" + tUSD.toLocaleString());
  setBar("treasuryBar", pct(tUSD, goals && goals.treasury_usd));

  // If your metrics.spent_pct_30d is 0–1, change the next line to:
  // const spentPct = Math.round((metrics.spent_pct_30d ?? 0) * 100);
  const spentPct = Math.round(metrics.spent_pct_30d ?? 0);
  setText("spendSave", `${spentPct}% spent / ${100 - spentPct}% saved`);
  setBar("spendBar", Math.max(0, Math.min(100, spentPct)));

  // referrals.json (items[])
  let totalRefs = 0;
  if(referrals && Array.isArray(referrals.items)){
    totalRefs = referrals.items.reduce((sum, r) => sum + (r.count || 0), 0);
  }
  setText("referrals", totalRefs.toLocaleString());
  setText("referralsNote", "from tracked sources");

  // projects table
  const pr = metrics.projects || {};
  const projBody = document.getElementById("projRows");
  if (projBody){
    projBody.innerHTML = "";
    [
      ["Proposed", pr.proposed],
      ["Approved", pr.approved],
      ["Funded", pr.funded],
      ["Delivered", pr.delivered]
    ].forEach(([label, val]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${label}</td><td>${val ?? 0}</td>`;
      projBody.appendChild(tr);
    });
  }

  // merchants table
  if(Array.isArray(merchants)){
    const mBody = document.getElementById("merchRows");
    if (mBody){
      mBody.innerHTML = "";
      merchants.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${m.url ? `<a href="${m.url}" target="_blank" rel="noopener">${m.name}</a>` : (m.name || "—")}</td>
          <td>${m.city || ""}</td>
          <td>${m.since || ""}</td>
          <td>${(m.monthly_volume ?? 0).toLocaleString()}</td>
        `;
        mBody.appendChild(tr);
      });
    }
  }

  // treasury chart
  const series = metrics.treasury_series || [];
  const labels = series.map(x => x[0]);
  const data = series.map(x => x[1]);
  const ctx = document.getElementById("treasuryChart");

  if(ctx && labels.length && window.Chart){
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Treasury (USD est)",
          data,
          tension: 0.25,
          borderColor: "#FFD700",
          borderWidth: 2,
          pointRadius: 0
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "#222" } },
          y: { grid: { color: "#222" } }
        }
      }
    });
  }

  // Map
  try{
    const mapNotice = document.getElementById("mapNotice");
    const hasGeo = Array.isArray(merchants) &&
      merchants.some(m => typeof m.lat === "number" && typeof m.lng === "number");

    if(!hasGeo){
      if(mapNotice) mapNotice.style.display = "block";
      return;
    }

    if(mapNotice) mapNotice.style.display = "none";

    const map = L.map("map", { zoomControl:true, scrollWheelZoom:false });

    const points = merchants.filter(m => typeof m.lat === "number" && typeof m.lng === "number");
    const latlngs = points.map(m => [m.lat, m.lng]);

    const avgLat = latlngs.reduce((s,p)=>s+p[0],0)/latlngs.length || 42.3314;
    const avgLng = latlngs.reduce((s,p)=>s+p[1],0)/latlngs.length || -83.0458;

    map.setView([avgLat, avgLng], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"© OpenStreetMap"
    }).addTo(map);

    points.forEach(m => {
      L.marker([m.lat, m.lng]).addTo(map)
        .bindPopup(
          `<b>${m.name || "Merchant"}</b><br>${m.city || ""}` +
          (m.url ? `<br><a href="${m.url}" target="_blank" rel="noopener">Website</a>` : "")
        );
    });

    if(latlngs.length > 1){
      map.fitBounds(latlngs, { padding:[20,20] });
    } else if (latlngs.length === 1){
      map.setView(latlngs[0], 11);
    }

  }catch(e){
    console.warn("Map init failed:", e);
  }
})();

// ---------- wallet connect + balances ----------
function updateButton(account){
  const btn = document.getElementById("connectBtn");
  if(!btn) return;

  if(account){
    btn.textContent = account.slice(0,6) + "..." + account.slice(-4);
    btn.style.background = "linear-gradient(90deg,#FFD700,#b8912f)";
    const wd = document.getElementById("walletDot");
    if(wd) wd.style.background = "#43a047";
  }else{
    btn.textContent = "Connect Wallet";
    btn.style.background = "";
    const wd = document.getElementById("walletDot");
    if(wd) wd.style.background = "#e53935";
  }
}

async function showBalance(account){
  if(!account) return;

  try{
    const provider = new ethers.JsonRpcProvider(ALKE_RPC);
    const contract = new ethers.Contract(
      TOKEN_ADDRESS,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );

    const raw = await contract.balanceOf(account);
    const userBal = Number(ethers.formatUnits(raw, TOKEN_DECIMALS));
    setText("walletBalance", `Your 7TRB (Alkebuleum): ${userBal.toFixed(3)} ${TOKEN_SYMBOL}`);

    const tRaw = await contract.balanceOf(TREASURY_WALLET);
    const tBal = Number(ethers.formatUnits(tRaw, TOKEN_DECIMALS));
    setText("treasuryBalance", `Treasury 7TRB (on-chain): ${tBal.toFixed(3)} ${TOKEN_SYMBOL}`);

    // Fill label fields if present
    setText("tokenContract", TOKEN_ADDRESS);
    setText("treasuryAddress", TREASURY_WALLET);

  }catch(err){
    console.error("Alkebuleum balance fetch failed:", err);
  }
}

async function connectWallet(){
  if(typeof window.ethereum === "undefined"){
    alert("No wallet found. Open this page in MetaMask or a Web3 browser.");
    return;
  }
  try{
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const account = accounts[0];
    updateButton(account);
    showBalance(account);
  }catch(err){
    console.error("Connect error:", err);
    alert("Wallet connection failed.");
  }
}

async function checkConnection(){
  if(typeof window.ethereum === "undefined") return;
  try{
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    if(accounts.length){
      updateButton(accounts[0]);
      showBalance(accounts[0]);
    }
  }catch(err){
    console.error("Auto-connect error:", err);
  }
}

if(typeof window.ethereum !== "undefined"){
  window.ethereum.on("accountsChanged", (accounts) => {
    if(!accounts.length){
      updateButton(null);
      setText("walletBalance", "");
      setText("treasuryBalance", "");
    }else{
      updateButton(accounts[0]);
      showBalance(accounts[0]);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectBtn");
  if(btn) btn.addEventListener("click", connectWallet);
  checkConnection();
});
