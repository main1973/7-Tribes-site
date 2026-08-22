/* ============================================================
   7TRIBES SHARED NAVIGATION
   ============================================================
   Auto-injects the mobile hamburger drawer into any page.
   Include at the bottom of every page:
   <script src="js/nav.js"></script>
   
   Requirements:
   - Page must have a <nav> or element with class "top-nav"
   - Page must link css/global-responsive.css for styling
   ============================================================ */

(function() {
  'use strict';

  // Load the shared counter after the footer exists. This fallback keeps the
  // device-visit display working even when a page's direct script request is
  // delayed by an embedded browser cache.
  function ensureVisitorCounter() {
    if (!document.getElementById('visitor-count') || window.__7trbVisitorCounterFallback) return;
    window.__7trbVisitorCounterFallback = true;
    var script = document.createElement('script');
    script.src = 'js/visitor-counter.js?v=device-visits-20260817&fallback=nav';
    script.async = true;
    document.body.appendChild(script);
  }

  ensureVisitorCounter();

  function ensureAccountNavigation() {
    if (window.__7trbAccountNavigationLoaded) return;
    window.__7trbAccountNavigationLoaded = true;
    var script = document.createElement('script');
    script.type = 'module';
    script.src = '/js/account-nav.js?v=7tribes-account-v2';
    document.body.appendChild(script);
  }

  // Navigation links — edit here to update across all pages.
  // The sections intentionally distinguish the public platform, community,
  // and resources rather than treating Loop as the entire ecosystem.
  var NAV_SECTIONS = [
    { title: 'Platform', links: [
      { label: 'Home', href: 'index.html' },
      { label: 'Learn', href: 'learn.html' },
      { label: 'Academy', href: 'academy/' },
      { label: 'Ecosystem', href: 'ecosystem.html' },
      { label: 'Transparency', href: 'transparency.html' }
    ]},
    { title: 'Community', links: [
      { label: 'Loop', href: 'https://loop.7trb.com' },
      { label: 'Connect', href: 'https://connect.7trb.com' },
      { label: 'Telegram', href: 'https://t.me/SevenTribeowner' }
    ]},
    { title: 'Resources', links: [
      { label: 'Builders', href: 'builders.html' },
      { label: 'Developers', href: 'developers.html' },
      { label: 'Dashboard', href: 'dashboard.html' }
    ]}
  ];

  function isCurrentPage(href) {
    if (/^https?:/i.test(href)) return false;
    var current = window.location.pathname.split('/').pop() || 'index.html';
    return current === href;
  }

  // Some legacy pages can have a drawer inserted before the associated toggle.
  // Complete that pairing instead of returning with an unreachable drawer.
  var existingDrawer = document.getElementById('mobile-drawer');
  if (existingDrawer) {
    var existingToggle = document.getElementById('menu-toggle');
    if (!existingToggle) {
      var existingDirectNav = document.querySelector('nav.mainNav');
      var existingHost = document.querySelector('.top-nav-inner') || document.querySelector('.header-inner') || document.querySelector('.topbar') || existingDirectNav;
      if (existingHost) {
        if (existingDirectNav && !existingDirectNav.querySelector('.mobile-platform-brand')) {
          var existingBrand = document.createElement('a');
          existingBrand.className = 'mobile-platform-brand';
          existingBrand.href = 'index.html';
          existingBrand.innerHTML = '<img src="images/7trb_symbol.png" alt="7TRB"> <span>7TRB</span>';
          existingDirectNav.insertBefore(existingBrand, existingDirectNav.firstChild);
        }
        existingToggle = document.createElement('button');
        existingToggle.className = 'menu-toggle';
        existingToggle.id = 'menu-toggle';
        existingToggle.setAttribute('aria-label', 'Open navigation menu');
        existingToggle.setAttribute('aria-expanded', 'false');
        existingToggle.innerHTML = '<span class="hamburger-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
        existingHost.appendChild(existingToggle);
        var existingOverlay = document.getElementById('menu-overlay');
        function openExistingMenu() {
          existingDrawer.classList.add('active');
          if (existingOverlay) existingOverlay.classList.add('active');
          document.body.classList.add('menu-open');
          existingToggle.setAttribute('aria-expanded', 'true');
        }
        function closeExistingMenu() {
          existingDrawer.classList.remove('active');
          if (existingOverlay) existingOverlay.classList.remove('active');
          document.body.classList.remove('menu-open');
          existingToggle.setAttribute('aria-expanded', 'false');
        }
        existingToggle.addEventListener('click', openExistingMenu);
        if (existingOverlay) existingOverlay.addEventListener('click', closeExistingMenu);
        var existingClose = existingDrawer.querySelector('#close-menu');
        if (existingClose) existingClose.addEventListener('click', closeExistingMenu);
        existingDrawer.querySelectorAll('a').forEach(function(link) { link.addEventListener('click', closeExistingMenu); });
      }
    }
    ensureAccountNavigation();
    return;
  }

  // --- Create hamburger button ---
  var toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.id = 'menu-toggle';
  toggle.setAttribute('aria-label', 'Open navigation menu');
  toggle.innerHTML = '<span class="hamburger-icon" aria-hidden="true"><span></span><span></span><span></span></span>';

  // Insert hamburger into the nav-inner
  var directMainNav = document.querySelector('nav.mainNav');
  var navInner = document.querySelector('.top-nav-inner') || 
                 document.querySelector('.header-inner') ||
                 document.querySelector('.topbar') ||
                 document.querySelector('nav > div') ||
                 directMainNav;
  if (navInner) {
    if (directMainNav && !directMainNav.querySelector('.mobile-platform-brand')) {
      var mobileBrand = document.createElement('a');
      mobileBrand.className = 'mobile-platform-brand';
      mobileBrand.href = 'index.html';
      mobileBrand.innerHTML = '<img src="images/7trb_symbol.png" alt="7TRB"> <span>7TRB</span>';
      directMainNav.insertBefore(mobileBrand, directMainNav.firstChild);
    }
    navInner.appendChild(toggle);
  }

  // --- Create overlay ---
  var overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  overlay.id = 'menu-overlay';

  // --- Create drawer ---
  var drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  drawer.id = 'mobile-drawer';

  var drawerHTML = '<div class="drawer-header">' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    '<img src="images/7trb_symbol.png" alt="7TRB">' +
    '<span>7TRB</span></div>' +
    '<button class="close-btn" id="close-menu" aria-label="Close menu">&times;</button></div>' +
    '<div class="drawer-content">';

  for (var i = 0; i < NAV_SECTIONS.length; i++) {
    drawerHTML += '<div class="drawer-section"><span class="drawer-section-title">' + NAV_SECTIONS[i].title + '</span>';
    for (var j = 0; j < NAV_SECTIONS[i].links.length; j++) {
      var link = NAV_SECTIONS[i].links[j];
      drawerHTML += '<a href="' + link.href + '"' + (isCurrentPage(link.href) ? ' aria-current="page"' : '') + '>' + link.label + '</a>';
    }
    drawerHTML += '</div>';
  }
  drawerHTML += '</div><div class="drawer-footer"><a class="drawer-cta" href="join/">Enter the Ecosystem</a></div>';
  drawer.innerHTML = drawerHTML;

  // Append to body
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  ensureAccountNavigation();

  // --- Event handlers ---
  function openMenu() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', openMenu);
  overlay.addEventListener('click', closeMenu);

  var closeBtn = document.getElementById('close-menu');
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close on link click
  var links = drawer.querySelectorAll('a');
  for (var k = 0; k < links.length; k++) {
    links[k].addEventListener('click', function() {
      closeMenu();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeMenu();
    }
  });

})();

// Post-parse resilience for legacy documents where a drawer can be created
// before the page has exposed a compatible navigation host. This preserves
// all existing links and only restores the missing toggle/close pairing.
(function () {
  'use strict';
  function repairDrawerToggle() {
    var drawer = document.getElementById('mobile-drawer');
    if (!drawer || document.getElementById('menu-toggle')) return;

    var directNav = document.querySelector('nav.mainNav');
    var host = directNav || document.querySelector('.top-nav-inner') || document.querySelector('.header-inner') || document.querySelector('.topbar');
    if (!host) return;

    if (directNav && !directNav.querySelector('.mobile-platform-brand')) {
      var brand = document.createElement('a');
      brand.className = 'mobile-platform-brand';
      brand.href = 'index.html';
      brand.innerHTML = '<img src="images/7trb_symbol.png" alt="7TRB"> <span>7TRB</span>';
      directNav.insertBefore(brand, directNav.firstChild);
    }

    var toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.id = 'menu-toggle';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="hamburger-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
    host.appendChild(toggle);

    var overlay = document.getElementById('menu-overlay');
    function closeMenu() {
      drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      drawer.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
    });
    if (overlay) overlay.addEventListener('click', closeMenu);
    var closeButton = drawer.querySelector('#close-menu');
    if (closeButton) closeButton.addEventListener('click', closeMenu);
    drawer.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', repairDrawerToggle);
  else window.setTimeout(repairDrawerToggle, 0);
})();
