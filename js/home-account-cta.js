/* 7TRIBES HOMEPAGE — Preserve the existing black-and-gold hero while exposing the established Account flow. */
import { academySession } from './academy-supabase.js';

async function updateHomepageAccountCta() {
  const cta = document.querySelector('[data-home-account-cta]');
  if (!cta) return;

  let session = null;
  try {
    session = await academySession();
  } catch (_) {
    session = null;
  }

  if (session) {
    cta.href = '/account/';
    cta.textContent = 'My Account';
    cta.setAttribute('aria-label', 'Open My Account');
    return;
  }

  cta.href = '/account/signup.html';
  cta.textContent = 'Create Profile';
  cta.setAttribute('aria-label', 'Create your 7Tribes profile');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateHomepageAccountCta, { once: true });
} else {
  updateHomepageAccountCta();
}
