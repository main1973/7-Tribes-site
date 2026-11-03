/* 7TRIBES HOMEPAGE — Preserve the existing black-and-gold hero while exposing the Academy Account flow. */
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
    cta.textContent = 'My Academy Account';
    cta.setAttribute('aria-label', 'Open My Academy Account');
    return;
  }

  cta.href = '/account/signup.html?returnTo=%2Facademy%2F';
  cta.textContent = 'Create Academy Account';
  cta.setAttribute('aria-label', 'Create a private Life Academy account');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateHomepageAccountCta, { once: true });
} else {
  updateHomepageAccountCta();
}
