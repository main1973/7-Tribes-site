/* Session-aware 7Tribes Account links for the shared mobile drawer. */
import { academySession } from './academy-supabase.js';

function accountSection(drawer) {
  let section = drawer.querySelector('[data-account-section]');
  if (!section) {
    section = document.createElement('div');
    section.className = 'drawer-section';
    section.dataset.accountSection = 'true';
    const footer = drawer.querySelector('.drawer-footer');
    (footer?.parentNode || drawer).insertBefore(section, footer || null);
  }
  return section;
}

async function updateAccountLinks() {
  const drawer = document.getElementById('mobile-drawer');
  if (!drawer) return;
  const section = accountSection(drawer);
  let session = null;
  try { session = await academySession(); } catch (_) { session = null; }
  section.innerHTML = `<span class="drawer-section-title">Account</span>${session ? '<a href="/account/">My Account</a>' : '<a href="/account/login.html">Log In</a><a href="/account/signup.html">Create Account</a>'}`;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateAccountLinks);
else updateAccountLinks();
