// wallet.js
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      const btn = document.getElementById('connectBtn');
      btn.textContent = account.slice(0, 6) + '...' + account.slice(-4);
      btn.style.background = 'linear-gradient(90deg, #FFD700, #b8912f)';
      console.log('Connected:', account);
    } catch (error) {
      console.error('Connection rejected:', error);
      alert('Wallet connection request was denied.');
    }
  } else {
    alert('No wallet found. Please install MetaMask or a compatible Web3 wallet.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('connectBtn');
  if (btn) btn.addEventListener('click', connectWallet);
});
