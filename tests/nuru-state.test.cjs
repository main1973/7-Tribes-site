const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const AA = "0x1111111111111111111111111111111111111111";
const SIGNER = "0x2222222222222222222222222222222222222222";
const UNIT = 10n ** 18n;

function toHex(value) {
  return "0x" + BigInt(value).toString(16);
}

function createProvider() {
  const listeners = new Map();
  const calls = [];
  const provider = {
    _isNuruWallet: true,
    chainId: "0x39F6E",
    calls,
    on(event, handler) {
      listeners.set(event, handler);
    },
    async request({ method, params = [] }) {
      calls.push({ method, params });
      if (method === "eth_accounts") return [SIGNER];
      if (method === "eth_requestAccounts") return [SIGNER];
      if (method === "nuru_getIdentity") {
        return { ain: "ain-test", primaryHandle: "tester", address: SIGNER, aaWallet: AA };
      }
      if (method === "eth_chainId") return provider.chainId;
      if (method === "eth_getBalance") return toHex(3n * UNIT);
      if (method === "eth_call") {
        const call = params[0];
        if (call.data === "0x313ce567") return toHex(18);
        const address = "0x" + call.data.slice(-40);
        if (address.toLowerCase() === AA.toLowerCase()) return toHex(125n * UNIT / 100n);
        if (address.toLowerCase() === SIGNER.toLowerCase()) return toHex(2n * UNIT);
        throw new Error("unexpected address");
      }
      throw new Error("unexpected method " + method);
    },
    emit(event, value) {
      const listener = listeners.get(event);
      if (listener) listener(value);
    }
  };
  return provider;
}

async function run() {
  const provider = createProvider();
  const storage = new Map();
  const window = {
    ethereum: provider,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    setTimeout,
  };
  const context = vm.createContext({
    window,
    console,
    BigInt,
    Event: class Event { constructor(type) { this.type = type; } },
    sessionStorage: {
      setItem(key, value) { storage.set(key, value); },
      getItem(key) { return storage.get(key) || null; },
      removeItem(key) { storage.delete(key); }
    },
    setTimeout
  });

  vm.runInContext(fs.readFileSync("js/nuru.js", "utf8"), context, { filename: "js/nuru.js" });
  await window.NuruWeb3.initialize();
  let state = window.NuruWeb3.getState();

  assert.equal(state.detected, true, "Nuru should be detected from the official marker");
  assert.equal(state.authorized, true, "an existing eth_accounts authorization should restore silently");
  assert.equal(state.decimals, 18, "token decimals must come from the deployed contract");
  assert.equal(state.aaBalance.normalized, "1.25");
  assert.equal(state.signerBalance.normalized, "2");
  assert.equal(state.totalBalance.normalized, "3.25");
  assert.equal(provider.calls.filter((entry) => entry.method === "eth_requestAccounts").length, 0, "initialize must never prompt");
  assert.equal(provider.calls.filter((entry) => entry.method === "eth_call" && entry.params[0].data.startsWith("0x70a08231")).length, 2, "both addresses must be read");

  await window.NuruWeb3.connect();
  assert.equal(provider.calls.filter((entry) => entry.method === "eth_requestAccounts").length, 1, "only the explicit connect action may request accounts");

  provider.chainId = "0x1";
  await window.NuruWeb3.refresh();
  state = window.NuruWeb3.getState();
  assert.equal(state.onAlkebuleum, false, "wrong networks must be detected before token reads");
  assert.equal(state.totalBalance.status, "wrong-network", "wrong network must not appear as a zero balance");

  provider.emit("accountsChanged", []);
  state = window.NuruWeb3.getState();
  assert.equal(state.authorized, false, "disconnect events must clear stale identity state");
  assert.equal(state.totalBalance.status, "idle", "disconnect events must clear stale balances");

  console.log("Nuru state tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
