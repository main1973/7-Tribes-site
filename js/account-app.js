/* 7TRIBES ACCOUNT — GitHub Pages browser flow backed by Supabase Auth and RLS. */
import { academySupabase, academySession, academyRole } from './academy-supabase.js';

const DEFAULT_RETURN = '/account/';
const safeReturnTo = (value) => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\u0000-\u001f]/.test(value)) return DEFAULT_RETURN;
  try {
    const parsed = new URL(value, window.location.origin);
    return parsed.origin === window.location.origin ? `${parsed.pathname}${parsed.search}${parsed.hash}` : DEFAULT_RETURN;
  } catch (_) { return DEFAULT_RETURN; }
};
const relative = (route) => new URL(route, window.location.origin).href;
const setStatus = (node, text, tone = '') => { if (node) { node.textContent = text; node.dataset.tone = tone; } };
const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

async function getContext() {
  const session = await academySession();
  return { session, role: session ? await academyRole() : 'member' };
}

function bindSignup() {
  const form = document.querySelector('[data-account-signup]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-account-status]');
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;
    const displayName = form.display_name.value.trim();
    if (!displayName) return setStatus(status, 'Enter the name you want to use in your private account.', 'error');
    if (password.length < 8) return setStatus(status, 'Use a password with at least 8 characters.', 'error');
    if (password !== confirmPassword) return setStatus(status, 'Your passwords do not match.', 'error');
    if (!form.terms.checked) return setStatus(status, 'Accept the Terms and Privacy Notice to create an account.', 'error');
    const button = form.querySelector('button[type="submit"]'); button.disabled = true;
    try {
      const returnTo = safeReturnTo(new URLSearchParams(location.search).get('returnTo'));
      const confirmationRoute = `/account/login.html?verified=1&returnTo=${encodeURIComponent(returnTo)}`;
      const { data, error } = await academySupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: relative(confirmationRoute),
          data: { display_name: displayName, terms_accepted: true, privacy_accepted: true, terms_version: '2026-08' }
        }
      });
      if (error) throw error;
      if (data.session) window.location.assign(returnTo);
      else setStatus(status, 'Check your email to verify your address. If you have used 7Tribes before, reset your password instead—creating another account does not replace an existing password.', 'success');
    } catch (error) {
      const duplicate = /already registered|already exists/i.test(error.message || '');
      setStatus(status, duplicate ? 'An account already exists for this email. Try Log In or Forgot Password.' : (error.message || 'Account could not be created.'), 'error');
    } finally { button.disabled = false; }
  });
}

function bindLogin() {
  const form = document.querySelector('[data-account-login]');
  if (!form) return;
  const verified = new URLSearchParams(location.search).get('verified');
  if (verified) setStatus(form.querySelector('[data-account-status]'), 'Email confirmed. You can now log in.', 'success');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-account-status]');
    const button = form.querySelector('button[type="submit"]'); button.disabled = true;
    try {
      const { error } = await academySupabase.auth.signInWithPassword({ email: form.email.value.trim(), password: form.password.value });
      if (error) throw error;
      window.location.assign(safeReturnTo(new URLSearchParams(location.search).get('returnTo')));
    } catch (_) { setStatus(status, 'Email or password is incorrect. You can reset your password if needed.', 'error'); }
    finally { button.disabled = false; }
  });
}

function bindForgotPassword() {
  const form = document.querySelector('[data-account-forgot]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-account-status]');
    try {
      const { error } = await academySupabase.auth.resetPasswordForEmail(form.email.value.trim(), { redirectTo: relative('/account/reset-password.html') });
      if (error) throw error;
      setStatus(status, 'If an account exists for this email, a secure reset link has been sent.', 'success');
    } catch (error) { setStatus(status, error.message || 'Password reset could not be requested.', 'error'); }
  });
}

function bindResetPassword() {
  const form = document.querySelector('[data-account-reset]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-account-status]');
    if (form.password.value.length < 8) return setStatus(status, 'Use a password with at least 8 characters.', 'error');
    if (form.password.value !== form.confirm_password.value) return setStatus(status, 'Your passwords do not match.', 'error');
    try {
      const { error } = await academySupabase.auth.updateUser({ password: form.password.value });
      if (error) throw error;
      setStatus(status, 'Password updated. You can continue to your account.', 'success');
      window.setTimeout(() => window.location.assign('/account/'), 900);
    } catch (error) { setStatus(status, error.message || 'A password recovery session is required. Request a new reset link.', 'error'); }
  });
}

async function renderAccount() {
  const holder = document.querySelector('[data-account-overview]');
  if (!holder) return;
  const { session, role } = await getContext();
  if (!session) { window.location.replace(`/account/login.html?returnTo=${encodeURIComponent('/account/')}`); return; }
  const { data, error } = await academySupabase.rpc('get_7tribes_account_overview');
  if (error || !data) { holder.textContent = 'Your private account details are temporarily unavailable.'; return; }
  holder.innerHTML = `<section class="account-summary"><span class="account-kicker">PRIVATE 7TRIBES ACCOUNT</span><h1>${escapeHtml(data.display_name || '7Tribes member')}</h1><p class="account-email">${escapeHtml(session.user.email)}</p><div class="account-metrics"><div><strong>${Number(data.completed_lessons) || 0}</strong><span>Lesson completions</span></div><div><strong>${data.capability_profile_ready ? 'Ready' : 'Not started'}</strong><span>Capability Profile</span></div></div></section><section class="account-actions"><a class="account-action" href="/academy/lesson-1.html">Continue Life Academy</a><a class="account-action" href="/academy/lesson-1.html#capability">Capability Profile</a><a class="account-action" href="/account/settings.html">Account settings</a>${['admin', 'founder_admin'].includes(role) ? '<a class="account-action" href="/academy/admin.html">Academy administration</a>' : ''}</section>`;
}

function bindSettings() {
  const form = document.querySelector('[data-account-settings]');
  if (!form) return;
  getContext().then(async ({ session }) => {
    if (!session) { window.location.replace('/account/login.html?returnTo=/account/settings.html'); return; }
    const { data } = await academySupabase.from('academy_profiles').select('display_name').eq('id', session.user.id).maybeSingle();
    form.display_name.value = data?.display_name || '';
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); const status = form.querySelector('[data-account-status]');
      const { error } = await academySupabase.from('academy_profiles').update({ display_name: form.display_name.value.trim() }).eq('id', session.user.id);
      setStatus(status, error ? error.message : 'Account settings saved privately.', error ? 'error' : 'success');
    });
  });
}

function bindSignOut() {
  document.querySelectorAll('[data-account-signout]').forEach((button) => button.addEventListener('click', async () => {
    await academySupabase.auth.signOut(); window.location.assign('/');
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  bindSignup(); bindLogin(); bindForgotPassword(); bindResetPassword(); renderAccount(); bindSettings(); bindSignOut();
});
