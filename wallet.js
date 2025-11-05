// Load Web3Modal and Ethers from CDN dynamically
(async function() {
  // Dynamically load the required scripts if not already loaded
  if (!window.Web3Modal) {
    await import('https://cdn.jsdelivr.net/npm/web3modal@1.9.12/dist/index.min.js');
  }
  if (!window.ethers) {
    await import('https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js');
  }

  const providerOptions = {};
  const web3Modal = new window.Web3Modal.default({
    cacheProvider: true,
    providerOptions
  });

  const connectBtn = document.getElementById('connectBtn');
  let provider;

  async function connectWallet() {
    try {
      const instance = await web3Modal.connect();
      provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const short = address.slice(0, 6) + '...' + address.slice(-4);

      connectBtn.textContent = 'Connected: ' + short;
      connectBtn.title = address; // tooltip shows full address
      connectBtn.disabled = true;
      connectBtn.style.opacity = '0.85';
    } catch (err) {
      console.warn('Wallet connect canceled or failed:', err);
    }
  }

  connectBtn.addEventListener('click', connectWallet);
})();
