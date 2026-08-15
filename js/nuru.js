/* 7TRB Nuru/Web3 state — public-site optional identity and wallet layer.
   Design reminder: 7trb.com remains public; Nuru authorization is requested only after a user action. */
(function (global) {
  "use strict";

  const CONFIG = Object.freeze({
    tokenAddress: "0x991df36e5b0bb596a83dee6a840f78bAa40450e0",
    tokenSymbol: "7TRB",
    chainIdDecimal: 237422,
    chainIdHex: "0x39F6E",
    chainName: "Alkebuleum"
  });

  const ERC20 = Object.freeze({
    decimals: "0x313ce567",
    balanceOf: "0x70a08231"
  });

  const state = {
    provider: null,
    detected: false,
    authorized: false,
    loading: false,
    primaryHandle: null,
    ain: null,
    signerAddress: null,
    aaWallet: null,
    chainId: null,
    decimals: null,
    aaBalance: createBalance("idle"),
    signerBalance: createBalance("idle"),
    totalBalance: createBalance("idle"),
    alkeBalance: createBalance("idle"),
    lastRefreshed: null,
    error: null,
    listeners: new Set(),
    boundProvider: null
  };

  function createBalance(status) {
    return { status: status, raw: null, normalized: null, error: null };
  }

  function isAddress(value) {
    return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
  }

  function sameAddress(a, b) {
    return isAddress(a) && isAddress(b) && a.toLowerCase() === b.toLowerCase();
  }

  function snapshot() {
    return {
      config: CONFIG,
      detected: state.detected,
      authorized: state.authorized,
      loading: state.loading,
      primaryHandle: state.primaryHandle,
      ain: state.ain,
      signerAddress: state.signerAddress,
      aaWallet: state.aaWallet,
      chainId: state.chainId,
      onAlkebuleum: Number(state.chainId) === CONFIG.chainIdDecimal,
      decimals: state.decimals,
      aaBalance: { ...state.aaBalance },
      signerBalance: { ...state.signerBalance },
      totalBalance: { ...state.totalBalance },
      alkeBalance: { ...state.alkeBalance },
      lastRefreshed: state.lastRefreshed,
      error: state.error
    };
  }

  function emit() {
    const next = snapshot();
    state.listeners.forEach(function (listener) {
      try {
        listener(next);
      } catch (error) {
        console.warn("Nuru state listener failed", error);
      }
    });
  }

  function setKnownState() {
    try {
      sessionStorage.setItem("7trb.nuru.known", JSON.stringify({
        authorized: state.authorized,
        signerAddress: state.signerAddress,
        aaWallet: state.aaWallet,
        updatedAt: state.lastRefreshed
      }));
    } catch (_) {
      // Storage is optional and never used as authorization evidence.
    }
  }

  function clearKnownState() {
    try {
      sessionStorage.removeItem("7trb.nuru.known");
    } catch (_) {
      // Storage may be unavailable in a private browser context.
    }
  }

  function clearIdentity() {
    state.authorized = false;
    state.loading = false;
    state.primaryHandle = null;
    state.ain = null;
    state.signerAddress = null;
    state.aaWallet = null;
    state.chainId = null;
    state.decimals = null;
    state.aaBalance = createBalance("idle");
    state.signerBalance = createBalance("idle");
    state.totalBalance = createBalance("idle");
    state.alkeBalance = createBalance("idle");
    state.lastRefreshed = null;
    state.error = null;
    clearKnownState();
    emit();
  }

  function normalizeHexChainId(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number.parseInt(value, 16);
    return null;
  }

  function formatUnits(rawValue, decimals, fractionDigits) {
    const raw = BigInt(rawValue);
    const unit = 10n ** BigInt(decimals);
    const whole = raw / unit;
    const remainder = raw % unit;
    const wholeText = whole.toLocaleString("en-US");

    if (remainder === 0n || fractionDigits === 0) return wholeText;

    const padded = remainder.toString().padStart(decimals, "0");
    const fractional = padded.slice(0, fractionDigits).replace(/0+$/, "");
    return fractional ? wholeText + "." + fractional : wholeText;
  }

  function balanceCallData(address) {
    return ERC20.balanceOf + address.slice(2).toLowerCase().padStart(64, "0");
  }

  async function request(method, params) {
    if (!state.provider || typeof state.provider.request !== "function") {
      throw new Error("Nuru provider is unavailable");
    }
    return state.provider.request({ method: method, params: params || [] });
  }

  function chooseNuruProvider(provider, info) {
    if (!provider) return false;
    const providerName = info && info.name ? String(info.name) : "";
    if (provider._isNuruWallet === true || /nuru/i.test(providerName)) {
      state.provider = provider;
      state.detected = true;
      bindProviderEvents();
      emit();
      return true;
    }
    return false;
  }

  function discoverProvider() {
    if (chooseNuruProvider(global.ethereum)) return Promise.resolve(state.provider);
    if (!global.addEventListener || !global.dispatchEvent) return Promise.resolve(null);

    return new Promise(function (resolve) {
      let settled = false;
      const finish = function (provider) {
        if (settled) return;
        settled = true;
        global.removeEventListener("eip6963:announceProvider", onAnnouncement);
        resolve(provider || null);
      };
      const onAnnouncement = function (event) {
        const detail = event && event.detail;
        if (detail && chooseNuruProvider(detail.provider, detail.info)) {
          finish(state.provider);
        }
      };

      global.addEventListener("eip6963:announceProvider", onAnnouncement);
      global.dispatchEvent(new Event("eip6963:requestProvider"));
      global.setTimeout(function () {
        finish(state.provider);
      }, 250);
    });
  }

  function bindProviderEvents() {
    if (!state.provider || state.boundProvider === state.provider || typeof state.provider.on !== "function") return;

    state.boundProvider = state.provider;
    state.provider.on("accountsChanged", function (accounts) {
      clearIdentity();
      if (Array.isArray(accounts) && accounts.length) {
        restoreAuthorizedState(accounts).catch(function () { clearIdentity(); });
      }
    });
    state.provider.on("connect", function () {
      restoreAuthorizedState().catch(function () { clearIdentity(); });
    });
    state.provider.on("disconnect", function () {
      clearIdentity();
    });
    state.provider.on("nuruIdentityChanged", function () {
      clearIdentity();
      restoreAuthorizedState().catch(function () { clearIdentity(); });
    });
    state.provider.on("chainChanged", function () {
      refresh();
    });
  }

  async function readDecimals() {
    const result = await request("eth_call", [{ to: CONFIG.tokenAddress, data: ERC20.decimals }, "latest"]);
    const decimals = Number(BigInt(result));
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
      throw new Error("The token contract returned invalid decimals");
    }
    state.decimals = decimals;
    return decimals;
  }

  async function readTokenBalance(address, decimals) {
    if (!isAddress(address)) {
      return { status: "unavailable", raw: null, normalized: null, error: "Wallet address unavailable" };
    }
    try {
      const rawHex = await request("eth_call", [{ to: CONFIG.tokenAddress, data: balanceCallData(address) }, "latest"]);
      const raw = BigInt(rawHex).toString();
      return { status: "available", raw: raw, normalized: formatUnits(raw, decimals, 4), error: null };
    } catch (error) {
      return { status: "unavailable", raw: null, normalized: null, error: error && error.message ? error.message : "Contract read failed" };
    }
  }

  async function readNativeBalance(address) {
    if (!isAddress(address)) return createBalance("unavailable");
    try {
      const rawHex = await request("eth_getBalance", [address, "latest"]);
      const raw = BigInt(rawHex).toString();
      return { status: "available", raw: raw, normalized: formatUnits(raw, 18, 4), error: null };
    } catch (error) {
      return { status: "unavailable", raw: null, normalized: null, error: error && error.message ? error.message : "Native balance read failed" };
    }
  }

  function calculateTotal() {
    const aa = state.aaBalance;
    const signer = state.signerBalance;

    if (signer.status === "same-address") {
      return aa.status === "available"
        ? { status: "available", raw: aa.raw, normalized: aa.normalized, error: null }
        : createBalance("unavailable");
    }

    const successful = [aa, signer].filter(function (balance) { return balance.status === "available"; });
    if (successful.length === 2) {
      const raw = (BigInt(aa.raw) + BigInt(signer.raw)).toString();
      return { status: "available", raw: raw, normalized: formatUnits(raw, state.decimals, 4), error: null };
    }
    if (successful.length === 1) {
      return { status: "partial", raw: successful[0].raw, normalized: successful[0].normalized, error: "One wallet balance is unavailable" };
    }
    return { status: "unavailable", raw: null, normalized: null, error: "Both wallet balance reads are unavailable" };
  }

  function setWrongNetworkState() {
    const message = "Switch to Alkebuleum to view 7TRB";
    state.aaBalance = { status: "wrong-network", raw: null, normalized: null, error: message };
    state.signerBalance = { status: "wrong-network", raw: null, normalized: null, error: message };
    state.totalBalance = { status: "wrong-network", raw: null, normalized: null, error: message };
    state.alkeBalance = { status: "wrong-network", raw: null, normalized: null, error: message };
  }

  async function refreshBalances() {
    if (!state.authorized) return snapshot();
    if (Number(state.chainId) !== CONFIG.chainIdDecimal) {
      setWrongNetworkState();
      state.lastRefreshed = null;
      emit();
      return snapshot();
    }

    state.loading = true;
    state.error = null;
    emit();

    try {
      const decimals = await readDecimals();
      const aaAddress = state.aaWallet;
      const signerAddress = state.signerAddress;
      const aaPromise = readTokenBalance(aaAddress, decimals);
      const nativePromise = readNativeBalance(aaAddress || signerAddress);
      state.aaBalance = await aaPromise;

      if (sameAddress(aaAddress, signerAddress)) {
        state.signerBalance = {
          status: "same-address",
          raw: state.aaBalance.raw,
          normalized: state.aaBalance.normalized,
          error: null
        };
      } else {
        state.signerBalance = await readTokenBalance(signerAddress, decimals);
      }

      state.alkeBalance = await nativePromise;
      state.totalBalance = calculateTotal();
      state.lastRefreshed = new Date().toISOString();
      if (state.totalBalance.status === "partial") state.error = state.totalBalance.error;
    } catch (error) {
      const message = error && error.message ? error.message : "Token balance read failed";
      state.aaBalance = { status: "unavailable", raw: null, normalized: null, error: message };
      state.signerBalance = { status: "unavailable", raw: null, normalized: null, error: message };
      state.totalBalance = { status: "unavailable", raw: null, normalized: null, error: message };
      state.alkeBalance = { status: "unavailable", raw: null, normalized: null, error: message };
      state.error = message;
      state.lastRefreshed = null;
    } finally {
      state.loading = false;
      setKnownState();
      emit();
    }
    return snapshot();
  }

  async function restoreAuthorizedState(preloadedAccounts) {
    try {
      const accounts = preloadedAccounts || await request("eth_accounts");
      if (!Array.isArray(accounts) || !accounts.length) {
        clearIdentity();
        return snapshot();
      }

      state.loading = true;
      state.authorized = true;
      state.signerAddress = accounts[0];
      state.error = null;
      emit();

      const identity = await request("nuru_getIdentity");
      const identityData = identity && identity.result ? identity.result : identity;
      state.primaryHandle = identityData && identityData.primaryHandle ? identityData.primaryHandle : null;
      state.ain = identityData && identityData.ain ? identityData.ain : null;
      state.signerAddress = identityData && isAddress(identityData.address) ? identityData.address : accounts[0];
      state.aaWallet = identityData && isAddress(identityData.aaWallet) ? identityData.aaWallet : null;
      state.chainId = normalizeHexChainId(await request("eth_chainId"));
      state.loading = false;
      emit();
      await refreshBalances();
    } catch (error) {
      state.loading = false;
      state.error = error && error.message ? error.message : "Nuru identity could not be loaded";
      state.aaBalance = { status: "unavailable", raw: null, normalized: null, error: state.error };
      state.signerBalance = { status: "unavailable", raw: null, normalized: null, error: state.error };
      state.totalBalance = { status: "unavailable", raw: null, normalized: null, error: state.error };
      state.alkeBalance = { status: "unavailable", raw: null, normalized: null, error: state.error };
      emit();
    }
    return snapshot();
  }

  async function initialize() {
    const provider = await discoverProvider();
    if (!provider) {
      state.detected = false;
      clearIdentity();
      return snapshot();
    }
    try {
      return await restoreAuthorizedState();
    } catch (error) {
      state.error = error && error.message ? error.message : "Nuru authorization could not be checked";
      emit();
      return snapshot();
    }
  }

  async function connect() {
    const provider = state.provider || await discoverProvider();
    if (!provider) throw new Error("Open this dashboard inside Nuru dApp Browser for full wallet identity features.");
    const accounts = await request("eth_requestAccounts");
    return restoreAuthorizedState(accounts);
  }

  async function refresh() {
    if (!state.provider) return initialize();
    if (!state.authorized) return restoreAuthorizedState();
    try {
      state.chainId = normalizeHexChainId(await request("eth_chainId"));
      return refreshBalances();
    } catch (error) {
      clearIdentity();
      return snapshot();
    }
  }

  function subscribe(listener) {
    state.listeners.add(listener);
    listener(snapshot());
    return function () { state.listeners.delete(listener); };
  }

  global.NuruWeb3 = Object.freeze({
    config: CONFIG,
    initialize: initialize,
    connect: connect,
    refresh: refresh,
    subscribe: subscribe,
    getState: snapshot
  });
})(window);
