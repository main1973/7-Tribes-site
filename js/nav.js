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

  // Navigation links — edit here to update across all pages.
  // The sections intentionally distinguish the public platform, community,
  // and resources rather than treating Loop as the entire ecosystem.
  var NAV_SECTIONS = [
    { title: 'Platform', links: [
      { label: 'Home', href: 'index.html' },
      { label: 'Learn', href: 'learn.html' },
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

  // Only inject if hamburger doesn't already exist (avoid duplicates)
  if (document.getElementById('mobile-drawer')) return;

  // --- Create hamburger button ---
  var toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.id = 'menu-toggle';
  toggle.setAttribute('aria-label', 'Open navigation menu');
  toggle.innerHTML = '<span class="hamburger-icon" aria-hidden="true"><span></span><span></span><span></span></span>';

  // Insert hamburger into the nav-inner
  var navInner = document.querySelector('.top-nav-inner') || 
                 document.querySelector('.header-inner') ||
                 document.querySelector('nav > div');
  if (navInner) {
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
