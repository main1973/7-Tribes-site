/**
 * 7Tribes dashboard updater (no deps)
 * - Reads data/metrics.json (creates if missing)
 * - Reads data/merchants.json to count merchants
 * - Fetches ETH balance from Etherscan + ETH price from CoinGecko
 * - Updates treasury_usd, updated_at, merchants, and treasury_series
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = process.cwd();
const METRICS_PATH = path.join(ROOT, 'data', 'metrics.json');
const MERCHANTS_PATH = path.join(ROOT, 'data', 'merchants.json');

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const TREASURY_ADDRESS  = process.env.TREASURY_ADDRESS;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': '7TribesBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error(`Invalid JSON from ${url}: ${e}`)); }
        } else {
          reject(new Error(`HTTP ${res.statusCode} from ${url}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function readJsonSafe(p, fallback) {
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (_) {}
  return fallback;
}

function writeJsonPretty(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function toISODate(d = new Date()) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

(async () => {
  if (!ETHERSCAN_API_KEY || !TREASURY_ADDRESS) {
    throw new Error('Missing ETHERSCAN_API_KEY or TREASURY_ADDRESS environment variables.');
  }

  // 1) Load current metrics + merchants
  const metrics = readJsonSafe(METRICS_PATH, {
    updated_at: toISODate(),
    holders: 0,
    active_wallets_30d: 0,
    treasury_usd: 0,
    treasury_series: [],
    spent_pct_30d: 0,
    projects: { proposed: 0, approved: 0, funded: 0, delivered: 0 },
    merchants: 0
  });

  const merchantsList = readJsonSafe(MERCHANTS_PATH, []);
  const merchantsCount = Array.isArray(merchantsList) ? merchantsList.length : 0;

  // 2) Fetch ETH balance (wei)
  const balUrl =
    `https://api.etherscan.io/api?module=account&action=balance&address=${TREASURY_ADDRESS}` +
    `&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
  const balRes = await fetchJson(balUrl);
  if (balRes.status !== '1') {
    throw new Error(`Etherscan error: ${JSON.stringify(balRes)}`);
  }
  const balanceWei = BigInt(balRes.result);                 // string → BigInt
  const ETH_DECIMALS = 10n ** 18n;
  const balanceETH = Number(balanceWei) / Number(ETH_DECIMALS);

  // 3) Fetch ETH price (USD)
  const priceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
  const priceRes = await fetchJson(priceUrl);
  const ethUsd = Number(priceRes?.ethereum?.usd || 0);

  // 4) Compute treasury USD
  const treasuryUsd = Math.round(balanceETH * ethUsd);

  // 5) Update metrics object
  const nowISO = toISODate();
  metrics.updated_at = nowISO;
  metrics.treasury_usd = treasuryUsd;
  metrics.merchants = merchantsCount;

  // Append/replace last point in treasury_series for "today"
  const today = new Date().toISOString().slice(0, 10);
  const series = Array.isArray(metrics.treasury_series) ? metrics.treasury_series : [];
  const last = series[series.length - 1];
  if (last && last[0] === today) {
    last[1] = treasuryUsd; // replace today's point
  } else {
    series.push([today, treasuryUsd]);
  }
  metrics.treasury_series = series.slice(-120); // keep last ~120 points (about 4 months daily)

  // 6) Save
  writeJsonPretty(METRICS_PATH, metrics);

  console.log(`Updated metrics.json @ ${nowISO}`);
  console.log(`Treasury ≈ $${treasuryUsd.toLocaleString()} (ETH=${balanceETH.toFixed(4)} at $${ethUsd})`);
  console.log(`Merchants: ${merchantsCount}`);
})().catch((err) => {
  console.error('Updater failed:', err);
  process.exit(1);
});
