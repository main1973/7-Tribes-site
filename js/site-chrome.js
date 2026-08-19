/* Shared non-destructive site chrome.
   Adds the canonical footer only on active public pages that do not already
   provide one. It preserves all existing pages, content, and integrations. */
(function () {
  'use strict';
  if (document.querySelector('footer') || document.documentElement.dataset.siteChromeLoaded) return;
  document.documentElement.dataset.siteChromeLoaded = 'true';

  var footer = document.createElement('footer');
  footer.className = 'site-standard-footer';
  footer.innerHTML =
    '<div class="site-standard-footer-inner">' +
      '<a class="site-standard-footer-brand" href="index.html"><img src="images/7trb_symbol.png" alt="7TRB"> <span>7TRIBES</span></a>' +
      '<nav aria-label="Footer navigation">' +
        '<a href="index.html">Home</a><a href="learn.html">Learn</a><a href="ecosystem.html">Ecosystem</a><a href="transparency.html">Transparency</a><a href="dashboard.html">Dashboard</a>' +
        '<a href="https://loop.7trb.com">Loop</a><a href="https://connect.7trb.com">Connect</a><a href="https://t.me/SevenTribeowner">Telegram</a>' +
      '</nav>' +
      '<p>© 2026 7Tribes • Mainhouse Oasis LLC</p>' +
    '</div>';
  document.body.appendChild(footer);
})();
