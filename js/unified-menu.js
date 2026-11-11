/* One source of truth for the public 7Tribes navigation.
   Included on each HTML page with /js/unified-menu.js.
   Account/session logic stays in /js/account-nav.js. */
(function () {
  'use strict';
  if (window.__sevenTribesMenuMounted) return;

  var SECTIONS = [
    {title:'Platform', links:[
      ['Home','/'], ['Learn','/learn.html'], ['Academy','/academy/'],
      ['Ecosystem','/ecosystem.html'], ['Transparency','/transparency.html']
    ]},
    {title:'Community', links:[
      ['Loop','https://loop.7trb.com'], ['Connect','https://connect.7trb.com'],
      ['Nuru','https://nuruai.org/'], ['Telegram','https://t.me/SevenTribeowner']
    ]},
    {title:'Resources', links:[
      ['Builders','/builders.html'], ['Developers','/developers.html'],
      ['Dashboard','/dashboard.html']
    ]}
  ];
  var QUICK = [
    ['Home','/'], ['Ecosystem','/ecosystem.html'], ['Learn','/learn.html'],
    ['Loop','https://loop.7trb.com'], ['Connect','https://connect.7trb.com'],
    ['Nuru','https://nuruai.org/']
  ];

  function current(href) {
    var path = window.location.pathname.replace(/\/+/g, '/');
    if (href === '/') return path === '/' || path === '/index.html';
    if (href === '/academy/') return path.indexOf('/academy/') === 0;
    if (href === '/learn.html') return path === '/learn.html' || path === '/learn-7trb.html';
    return path === href;
  }

  // Official public app favicons: Loop and Connect from their respective site
  // assets, Nuru from its developer's website. Text remains visible if an icon fails.
  var APP_ICON_URLS = {
    'Loop': 'https://loop.7trb.com/favicon.png',
    'Connect': 'https://connect.7trb.com/favicon.ico',
    'Nuru': 'https://nuruai.org/favicon.ico'
  };
  function link(label, href, className) {
    var a = document.createElement('a');
    a.href = href;
    if (className) a.className = className;
    if (APP_ICON_URLS[label]) {
      var icon = document.createElement('img');
      icon.src = APP_ICON_URLS[label];
      icon.className = 'seven-app-icon';
      icon.alt = '';
      icon.width = 22;
      icon.height = 22;
      icon.decoding = 'async';
      icon.addEventListener('error', function () { icon.hidden = true; });
      a.appendChild(icon);
    }
    var text = document.createElement('span');
    text.textContent = label;
    a.appendChild(text);
    if (current(href)) a.setAttribute('aria-current', 'page');
    return a;
  }

  function begin() {
    if (!document.body || document.getElementById('seven-nav-bar')) return;
    window.__sevenTribesMenuMounted = true;

    var header = document.createElement('header');
    header.id = 'seven-nav-bar';
    var inner = document.createElement('div');
    inner.className = 'seven-nav-inner';
    var brand = document.createElement('a');
    brand.className = 'seven-nav-brand';
    brand.href = '/';
    brand.setAttribute('aria-label', '7Tribes home');
    var logo = document.createElement('img');
    logo.src = '/images/7trb_symbol.png';
    logo.alt = '';
    logo.width = 36;
    logo.height = 36;
    var brandText = document.createElement('span');
    brandText.textContent = '7TRIBES';
    brand.appendChild(logo);
    brand.appendChild(brandText);
    inner.appendChild(brand);

    var quick = document.createElement('nav');
    quick.className = 'seven-nav-quick';
    quick.setAttribute('aria-label', 'Quick links');
    QUICK.forEach(function (item) { quick.appendChild(link(item[0], item[1])); });
    inner.appendChild(quick);

    var toggle = document.createElement('button');
    toggle.id = 'menu-toggle';
    toggle.className = 'seven-menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open site menu');
    toggle.setAttribute('aria-controls', 'mobile-drawer');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span>Menu</span><span class="seven-menu-bars" aria-hidden="true"><i></i><i></i><i></i></span>';
    inner.appendChild(toggle);
    header.appendChild(inner);

    var overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.className = 'seven-menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var drawer = document.createElement('aside');
    drawer.id = 'mobile-drawer';
    drawer.className = 'seven-menu-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', '7Tribes site menu');
    drawer.setAttribute('aria-hidden', 'true');

    var drawerHeader = document.createElement('div');
    drawerHeader.className = 'drawer-header';
    var drawerBrand = link('7TRIBES', '/', 'seven-drawer-brand');
    var drawerLogo = document.createElement('img');
    drawerLogo.src = '/images/7trb_symbol.png';
    drawerLogo.alt = '';
    drawerLogo.width = 32;
    drawerLogo.height = 32;
    drawerBrand.insertBefore(drawerLogo, drawerBrand.firstChild);
    drawerHeader.appendChild(drawerBrand);
    var closeButton = document.createElement('button');
    closeButton.id = 'close-menu';
    closeButton.type = 'button';
    closeButton.className = 'seven-menu-close';
    closeButton.setAttribute('aria-label', 'Close site menu');
    closeButton.textContent = '\u00d7';
    drawerHeader.appendChild(closeButton);
    drawer.appendChild(drawerHeader);

    var content = document.createElement('div');
    content.className = 'drawer-content';
    SECTIONS.forEach(function (group) {
      var section = document.createElement('section');
      section.className = 'drawer-section';
      var heading = document.createElement('span');
      heading.className = 'drawer-section-title';
      heading.textContent = group.title;
      section.appendChild(heading);
      group.links.forEach(function (item) { section.appendChild(link(item[0], item[1])); });
      content.appendChild(section);
    });
    var account = document.createElement('section');
    account.className = 'drawer-section';
    account.setAttribute('data-account-section', 'true');
    var accountHeading = document.createElement('span');
    accountHeading.className = 'drawer-section-title';
    accountHeading.textContent = 'Account';
    account.appendChild(accountHeading);
    account.appendChild(link('Log In', '/account/login.html'));
    account.appendChild(link('Create Account', '/account/signup.html'));
    content.appendChild(account);
    drawer.appendChild(content);

    var footer = document.createElement('div');
    footer.className = 'drawer-footer';
    footer.appendChild(link('Join 7Tribes', '/join/', 'drawer-cta'));
    drawer.appendChild(footer);

    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Replace only old site-wide navigation. Preserve topic tabs, account sign-out,
    // Academy lesson controls, referral links and checkout actions.
    document.querySelectorAll(
      'nav.top-nav, nav.mainNav, nav.nav-links, .site-header .header-inner'
    ).forEach(function (old) {
      if (old !== header && !old.closest('#seven-nav-bar') && !old.closest('#mobile-drawer')) {
        old.classList.add('seven-nav-legacy');
      }
    });
    var path = window.location.pathname;
    if (path === '/earn.html' || path === '/digital.html') {
      var plainNav = Array.prototype.find.call(document.querySelectorAll('nav'), function (node) {
        return !node.closest('#seven-nav-bar') && !node.closest('#mobile-drawer');
      });
      if (plainNav && !plainNav.closest('#seven-nav-bar')) plainNav.classList.add('seven-nav-legacy');
    }
    if (path === '/wallet.html') document.body.classList.add('seven-nav-wallet');
    document.body.classList.add('seven-nav-ready');

    var priorFocus = null;
    function openMenu() {
      priorFocus = document.activeElement;
      drawer.setAttribute('aria-hidden', 'false');
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('seven-nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close site menu');
      closeButton.focus();
    }
    function closeMenu(restoreFocus) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('seven-nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open site menu');
      if (restoreFocus && priorFocus && typeof priorFocus.focus === 'function') priorFocus.focus();
    }

    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('active')) closeMenu(true);
      else openMenu();
    });
    closeButton.addEventListener('click', function () { closeMenu(true); });
    overlay.addEventListener('click', function () { closeMenu(true); });
    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a[href]')) closeMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (!drawer.classList.contains('active')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
      if (event.key !== 'Tab') return;
      var focusables = Array.prototype.slice.call(drawer.querySelectorAll('a[href], button:not([disabled])'));
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });

    // The Account menu stays session-aware using the existing Supabase module.
    if (!document.querySelector('script[data-unified-account-nav]')) {
      var accountScript = document.createElement('script');
      accountScript.type = 'module';
      accountScript.src = '/js/account-nav.js?v=unified-20261110';
      accountScript.setAttribute('data-unified-account-nav', 'true');
      document.body.appendChild(accountScript);
    }

    // Preserve the visit-counter fallback for older pages without its script.
    if (document.getElementById('visitor-count') && !document.querySelector('script[src*="visitor-counter.js"]')) {
      var counter = document.createElement('script');
      counter.src = '/js/visitor-counter.js?v=device-visits-20260817';
      document.body.appendChild(counter);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin);
  else begin();
})();
