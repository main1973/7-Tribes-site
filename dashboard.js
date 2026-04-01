// ----------------------------
// 7TRB Dashboard Logic
// ----------------------------

// Alkebuleum config
const ALKE_RPC = "https://rpc.alkebuleum.com";
const TOKEN_ADDRESS = "0x991DF36e5b0BB596A83dEe6A840F78bAa40450e0";
const TOKEN_DECIMALS = 18;
const TOKEN_SYMBOL = "7TRB";
const TREASURY_WALLET = "0x26B0cA2C767758Fc3E34e0481065a55521E42BaB";

const JOLLOFSWAP_URL = "https://jollofswap.com";
const AMVAULT_URL = "https://amvault.net";
const SAVED_WALLET_KEY = "amvault_wallet";

// ---------- helpers ----------
async function safeJson(url){
  try{
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) throw new Error(`${url}: ${res.status}`);
    return await res.json();
  }catch(err){
    console.warn("Fetch failed:", url, err);
    return null;
  }
}

function setText(id, txt){
  const el = document.getElementById(id);
  if(el) el.textContent = txt;
}

function setHTML(id, html){
  const el = document.getElementById(id);
  if(el) el.innerHTML = html;
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

function formatNum(n){
  return Number(n || 0).toLocaleString();
}

function formatMoney(n){
  return "$" + Number(n || 0).toLocaleString();
}

function isValidWallet(address){
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function openDex(){
  window.open(JOLLOFSWAP_URL, "_blank");
}

function openAmVault(){
  window.open(AMVAULT_URL, "_blank");
}

async function getTokenBalance(address){
  const provider = new ethers.JsonRpcProvider(ALKE_RPC);
  const contract = new ethers.Contract(
    TOKEN_ADDRESS,
    ["function balanceOf(address owner) view returns (uint256)"],
    provider
  );
  const raw = await contract.balanceOf(address);
  return Number(ethers.formatUnits(raw, TOKEN_DECIMALS));
}

// ---------- wallet save/load ----------
function loadSavedWallet(){
  const saved = localStorage.getItem(SAVED_WALLET_KEY);
  const input = document.getElementById("walletInput");
  const note = document.getElementById("savedWalletNote");
  const walletDot = document.getElementById("walletDot");

  if(saved){
    if(input) input.value = saved;
    if(note) note.textContent = `Saved wallet: ${saved}`;
    if(walletDot) walletDot.style.background = "#43a047";
    return saved;
  }

  if(note) note.textContent = "No wallet saved yet.";
  if(walletDot) walletDot.style.background = "#e53935";
  return null;
}

async function saveWallet(){
  const input = document.getElementById("walletInput");
  const note = document.getElementById("savedWalletNote");

  if(!input) return;
  const wallet = input.value.trim();

  if(!isValidWallet(wallet)){
    alert("Enter a valid wallet address.");
    return;
  }

  localStorage.setItem(SAVED_WALLET_KEY, wallet);

  if(note) note.textContent = `Saved wallet: ${wallet}`;
  const walletDot = document.getElementById("walletDot");
  if(walletDot) walletDot.style.background = "#43a047";

  await showBalance(wallet);
}

function clearWallet(){
  localStorage.removeItem(SAVED_WALLET_KEY);

  const input = document.getElementById("walletInput");
  const note = document.getElementById("savedWalletNote");
  const walletDot = document.getElementById("walletDot");

  if(input) input.value = "";
  if(note) note.textContent = "No wallet saved yet.";
  if(walletDot) walletDot.style.background = "#e53935";

  setText("walletBalance", "");
  setText("tokenBalance", "");
}

// ---------- balance display ----------
async function showBalance(account){
  if(!account) return;

  try{
    setText("walletBalance", `Saved Wallet: ${account}`);

    const userBal = await getTokenBalance(account);
    setText("tokenBalance", `Your 7TRB Balance: ${userBal.toFixed(3)} ${TOKEN_SYMBOL}`);

    const treasuryBal = await getTokenBalance(TREASURY_WALLET);
    setText("treasuryBalance", `Treasury 7TRB (on-chain): ${treasuryBal.toFixed(3)} ${TOKEN_SYMBOL}`);
    setText("treasuryTokenBalance", treasuryBal.toFixed(3));

    const systemBanner = document.getElementById("systemBanner");
    const networkDot = document.getElementById("networkDot");
    if(systemBanner) systemBanner.style.display = "block";
    if(networkDot) networkDot.style.background = "#43a047";
  }catch(err){
    console.error("Balance fetch failed:", err);
    setText("tokenBalance", "Unable to load 7TRB balance.");
    setText("treasuryBalance", "Unable to load treasury balance.");
    setText("treasuryTokenBalance", "—");
  }
}

// ---------- metrics + tables ----------
(async function initDashboard(){
  const [goals, metrics, merchants, referrals, activity] = await Promise.all([
    safeJson("data/goals.json"),
    safeJson("data/metrics.json"),
    safeJson("data/merchants.json"),
    safeJson("data/referrals.json"),
    safeJson("data/activity.json")
  ]);

  if(!metrics){
    setText("updatedAt", "— (awaiting data/metrics.json)");
  } else {
    const upd = metrics.updated_at ? new Date(metrics.updated_at) : null;
    setText("updatedAt", (upd && !isNaN(upd)) ? upd.toLocaleString() : "—");

    const freshDot = document.getElementById("freshDot");
    if (freshDot && upd && !isNaN(upd)){
      const hrs = (Date.now() - upd.getTime()) / 36e5;
      freshDot.style.background = hrs <= 24 ? "#22c55e" : (hrs <= 72 ? "#f59e0b" : "#ef4444");
      freshDot.title = `Data age: ${hrs.toFixed(1)}h`;
    }

    const holders = metrics.holders ?? 0;
    setText("holders", formatNum(holders));
    setBar("holdersBar", pct(holders, goals && goals.holders));

    const active = metrics.active_wallets_30d ?? 0;
    setText("active", formatNum(active));

    const tUSD = Math.round(metrics.treasury_usd ?? 0);
    setText("treasury", formatMoney(tUSD));
    setBar("treasuryBar", pct(tUSD, goals && goals.treasury_usd));

    const spentPctRaw = metrics.spent_pct_30d ?? 0;
    const spentPct = spentPctRaw <= 1 ? Math.round(spentPctRaw * 100) : Math.round(spentPctRaw);
    setText("spendSave", `${spentPct}% / ${100 - spentPct}%`);
    setBar("spendBar", Math.max(0, Math.min(100, spentPct)));

    let totalRefs = 0;
    if(referrals && Array.isArray(referrals.items)){
      totalRefs = referrals.items.reduce((sum, r) => sum + (r.count || 0), 0);
    }
    setText("referrals", formatNum(totalRefs));
    setText("referralsNote", "from tracked sources");

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
          <td>${formatNum(m.monthly_volume ?? 0)}</td>
        `;
        mBody.appendChild(tr);
      });
    }
  }

  // map
  try{
    const mapNotice = document.getElementById("mapNotice");
    const hasGeo = Array.isArray(merchants) &&
      merchants.some(m => typeof m.lat === "number" && typeof m.lng === "number");

    if(!hasGeo){
      if(mapNotice) mapNotice.style.display = "block";
    } else {
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
    }
  }catch(e){
    console.warn("Map init failed:", e);
  }

  // activity
  const activityList = document.getElementById("activityList");
  if(activityList){
    activityList.innerHTML = "";

    if(activity && Array.isArray(activity.items) && activity.items.length){
      activity.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "activity-item";

        const title = item.title || item.type || "Circulation event";
        const body = item.description || item.detail || "";
        const meta = item.date || item.when || "";

        div.innerHTML = `
          <strong>${title}</strong>
          ${meta ? `<div class="mini" style="margin-top:4px;">${meta}</div>` : ""}
          ${body ? `<div style="margin-top:6px;">${body}</div>` : ""}
        `;
        activityList.appendChild(div);
      });
    } else {
      activityList.innerHTML = `<div class="activity-item muted">No circulation events loaded yet. Add <code>data/activity.json</code>.</div>`;
    }
  }
})();

// ---------- boot ----------
document.addEventListener("DOMContentLoaded", async () => {
  const openAmVaultBtn = document.getElementById("openAmVaultBtn");
  const saveWalletBtn = document.getElementById("saveWalletBtn");
  const clearWalletBtn = document.getElementById("clearWalletBtn");

  if(openAmVaultBtn) openAmVaultBtn.addEventListener("click", openAmVault);
  if(saveWalletBtn) saveWalletBtn.addEventListener("click", saveWallet);
  if(clearWalletBtn) clearWalletBtn.addEventListener("click", clearWallet);

  const saved = loadSavedWallet();
  if(saved){
    await showBalance(saved);
  } else {
    try{
      const treasuryBal = await getTokenBalance(TREASURY_WALLET);
      setText("treasuryBalance", `Treasury 7TRB (on-chain): ${treasuryBal.toFixed(3)} ${TOKEN_SYMBOL}`);
      setText("treasuryTokenBalance", treasuryBal.toFixed(3));

      const networkDot = document.getElementById("networkDot");
      if(networkDot) networkDot.style.background = "#43a047";

      const systemBanner = document.getElementById("systemBanner");
      if(systemBanner) systemBanner.style.display = "block";
    }catch(err){
      console.error(err);
    }
  }
});
