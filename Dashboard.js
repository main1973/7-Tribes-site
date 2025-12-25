// dashboard.js — 7TRB Dashboard Logic
// Uses:
//  - data/metrics.json
//  - data/merchants.json
// Updates DOM ids found in dashboard.html

(async function () {
  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);

  function fmtNum(n) {
    const v = Number(n || 0);
    return v.toLocaleString();
  }

  function fmtMoney(n) {
    const v = Number(n || 0);
    return "$" + v.toLocaleString();
  }

  function safeText(el, value) {
    if (!el) return;
    el.textContent = value;
  }

  async function loadJson(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(`${path} not found`);
    return r.json();
  }

  // ---------- load data ----------
  let metrics, merchants;

  try {
    [metrics, merchants] = await Promise.all([
      loadJson("data/metrics.json"),
      loadJson("data/merchants.json"),
    ]);
  } catch (e) {
    console.error(e);
    // minimal fail-safe UI
    safeText($("updatedAt"), "—");
    safeText($("holders"), "0");
    safeText($("active"), "0");
    safeText($("treasury"), "$0");
    safeText($("spendSave"), "0%");
    safeText($("referrals"), "0");
    const merchRows = $("merchRows");
    if (merchRows) merchRows.innerHTML = `<tr><td colspan="4">⚠️ ${e.message}</td></tr>`;
    return;
  }

  // ---------- merchant derived stats ----------
  const merchantCount = Array.isArray(merchants) ? merchants.length : 0;

  const citySet = new Set(
    (merchants || [])
      .map((m) => (m.city || "").trim())
      .filter(Boolean)
  );
  const cityCount = citySet.size;

  const merchantMonthlyVolume = (merchants || []).reduce(
    (sum, m) => sum + Number(m.monthly_volume || 0),
    0
  );

  // OPTIONAL: inject merchant-derived numbers into metrics object (in-memory only)
  metrics.merchants = merchantCount;
  metrics.merchant_cities = cityCount;
  metrics.merchant_volume_monthly = merchantMonthlyVolume;

  // ---------- render timestamp ----------
  // metrics.updated_at already exists
  if ($("updatedAt")) {
    const d = metrics.updated_at ? new Date(metrics.updated_at) : null;
    safeText($("updatedAt"), d && !isNaN(d) ? d.toLocaleString() : "—");
  }

  // ---------- KPI cards ----------
  safeText($("holders"), fmtNum(metrics.holders));
  safeText($("active"), fmtNum(metrics.active_wallets_30d));
  safeText($("treasury"), fmtMoney(metrics.treasury_usd));

  // spent_pct_30d is a percent number (0-100)
  safeText($("spendSave"), `${Number(metrics.spent_pct_30d || 0).toFixed(0)}%`);

  // You currently have "Referrals (30d)" in HTML.
  // If you haven't added referrals in metrics.json yet, we can repurpose it:
  // Show merchant count until referrals are implemented.
  safeText($("referrals"), fmtNum(metrics.referrals_30d ?? metrics.merchants ?? 0));

  // ---------- progress bars ----------
  // goals.json is optional; if you have it, we use it. If not, bars still work at 0.
  let goals = null;
  try {
    goals = await loadJson("data/goals.json");
  } catch (_) {}

  const holdersGoal = goals?.holders?.goal || 0;
  const treasuryGoal = goals?.treasury_usd?.goal || 0;

  // holders bar
  if ($("holdersBar")) {
    const pct = holdersGoal ? Math.min(100, (metrics.holders / holdersGoal) * 100) : 0;
    $("holdersBar").style.width = `${pct}%`;
  }

  // treasury bar
  if ($("treasuryBar")) {
    const pct = treasuryGoal ? Math.min(100, (metrics.treasury_usd / treasuryGoal) * 100) : 0;
    $("treasuryBar").style.width = `${pct}%`;
  }

  // spend bar (spent_pct_30d)
  if ($("spendBar")) {
    const pct = Math.max(0, Math.min(100, Number(metrics.spent_pct_30d || 0)));
    $("spendBar").style.width = `${pct}%`;
  }

  // ---------- projects pipeline table ----------
  const projRows = $("projRows");
  if (projRows) {
    const p = metrics.projects || {};
    const rows = [
      ["Proposed", p.proposed ?? 0],
      ["Approved", p.approved ?? 0],
      ["Funded", p.funded ?? 0],
      ["Delivered", p.delivered ?? 0],
    ];
    projRows.innerHTML = rows
      .map(([k, v]) => `<tr><td>${k}</td><td>${fmtNum(v)}</td></tr>`)
      .join("");
  }

  // ---------- treasury chart ----------
  try {
    const series = metrics.treasury_series || [];
    const labels = series.map((x) => x[0]);
    const values = series.map((x) => Number(x[1] || 0));

    const ctx = document.getElementById("treasuryChart");
    if (ctx && window.Chart) {
      new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Treasury (USD)",
              data: values,
              tension: 0.35,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { callback: (v) => "$" + v } },
          },
        },
      });
    }
  } catch (e) {
    console.error("Chart error:", e);
  }

  // ---------- merchant table ----------
  const merchRows = $("merchRows");
  if (merchRows) {
    const list = Array.isArray(merchants) ? merchants : [];
    merchRows.innerHTML = "";

    list.forEach((m) => {
      const name = m.url
        ? `<a href="${m.url}" target="_blank" rel="noopener">${m.name || ""}</a>`
        : (m.name || "");

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name}</td>
        <td>${m.city || ""}</td>
        <td>${m.since || ""}</td>
        <td>${fmtNum(m.monthly_volume)}</td>
      `;
      merchRows.appendChild(tr);
    });

    if (!merchRows.children.length) {
      merchRows.innerHTML = `<tr><td colspan="4">No merchants yet.</td></tr>`;
    }
  }

  // ---------- merchant map ----------
  try {
    const mapEl = document.getElementById("map");
    if (mapEl && window.L) {
      // default to Detroit
      const map = L.map("map").setView([42.3314, -83.0458], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const list = Array.isArray(merchants) ? merchants : [];

      list.forEach((m) => {
        const lat = Number(m.lat);
        const lng = Number(m.lng);
        if (!isFinite(lat) || !isFinite(lng)) return;

        const popup = `
          <b>${m.name || "Merchant"}</b><br/>
          ${m.city || ""}<br/>
          Monthly 7TRB: ${fmtNum(m.monthly_volume)}<br/>
          ${m.url ? `<a href="${m.url}" target="_blank" rel="noopener">Visit</a>` : ""}
        `;

        L.marker([lat, lng]).addTo(map).bindPopup(popup);
      });

      // if we have at least one marker, fit bounds
      const pts = list
        .map((m) => [Number(m.lat), Number(m.lng)])
        .filter(([a, b]) => isFinite(a) && isFinite(b));

      if (pts.length > 0) {
        const bounds = L.latLngBounds(pts);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  } catch (e) {
    console.error("Map error:", e);
  }

})();
