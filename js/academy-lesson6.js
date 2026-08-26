/* 7TRIBES LIFE ACADEMY — Lesson 6 keeps wealth-transfer learning public while private money mapping remains RLS-backed. */
import { academySupabase, academySession } from './academy-supabase.js';

const lessonSlug = 'how-wealth-transfers';
const requiredSections = ['wealth-not-money', 'transaction-sides', 'consumption-assets', 'ownership-destination', 'transfer-channels', 'renting-owning', 'interest-debt', 'intergenerational', 'wealth-destruction', 'circulation-effect', 'community-capacity', 'follow-100', 'follow-own-money', 'knowledge-check'];
const state = { session: null, lesson: null, viewed: new Set(), completed: false };
const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const setStatus = (node, value, tone = '') => { if (node) { node.textContent = value; node.dataset.tone = tone; } };

function requireAccount(status, anchor) {
  const returnTo = `${location.pathname}${anchor || location.hash || ''}`;
  if (status) {
    status.dataset.tone = 'error';
    status.innerHTML = `Save your progress <a href="/account/signup.html?returnTo=${encodeURIComponent(returnTo)}">Create a free 7Tribes account</a> to continue your Life Academy journey and return where you left off. <a href="/account/login.html?returnTo=${encodeURIComponent(returnTo)}">Log In</a>`;
  }
}

async function loadSession() {
  try { state.session = await academySession(); } catch (_) { state.session = null; }
  document.documentElement.dataset.academyAuth = state.session ? 'signed-in' : 'signed-out';
}

async function loadLesson() {
  const { data, error } = await academySupabase.from('academy_lessons').select('id,title,status').eq('slug', lessonSlug).maybeSingle();
  if (error) throw error;
  state.lesson = data;
  if (state.session && data?.id) {
    const { data: completion } = await academySupabase.from('academy_completions').select('completed_at').eq('lesson_id', data.id).maybeSingle();
    state.completed = Boolean(completion?.completed_at);
    if (state.completed) setCompletedUI();
  }
}

async function markSection(section) {
  if (!state.session || !state.lesson?.id || state.viewed.has(section)) return;
  state.viewed.add(section);
  await academySupabase.rpc('track_academy_lesson_section', { p_lesson_id: state.lesson.id, p_section: section });
}

function observeSections() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => entries.filter((entry) => entry.isIntersecting && entry.intersectionRatio > .35).forEach((entry) => markSection(entry.target.dataset.l6Section)), { threshold: [.35] });
  document.querySelectorAll('[data-l6-section]').forEach((node) => observer.observe(node));
}

function setupTransaction() {
  const output = document.querySelector('[data-l6-transaction-feedback]');
  const messages = {
    labor: 'Labor can be one destination. Revenue may support compensation, while a worker may later spend, save, repay debt, or acquire assets.',
    supplier: 'Inventory and suppliers can be another destination. That payment can then become someone else’s revenue and meet their own obligations.',
    debt: 'Debt, taxes, rent, utilities, and other obligations can receive part of revenue. Revenue is not the same as profit.',
    reinvest: 'A business may reinvest part of revenue into equipment, inventory, repairs, technology, training, or other capability. Outcomes are not guaranteed.'
  };
  document.querySelectorAll('[data-l6-transaction-path]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-l6-transaction-path]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
    output.textContent = messages[button.dataset.l6TransactionPath];
    await markSection('transaction-sides');
  }));
}

function asNumber(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function setupFollow100() {
  const root = document.querySelector('[data-l6-follow]');
  if (!root) return;
  const pathOutput = root.querySelector('[data-l6-path-output]');
  const paths = {
    spend: ['Spend', 'A purchase can exchange money for immediate use. Ask what was received, who receives revenue, and what obligations come next.'],
    save: ['Save', 'Saving can preserve liquidity for future use. It does not automatically guarantee purchasing power or return.'],
    debt: ['Pay debt', 'A debt payment can reduce a liability according to an agreement and may include principal and financing costs.'],
    asset: ['Purchase an asset', 'An asset purchase can change what is owned or controlled, but value, risk, maintenance, and returns can vary.'],
    local: ['Local business', 'Illustrative local-business allocations below show one possible way revenue can meet suppliers, labor, overhead, obligations, reinvestment, and a remainder.'],
    outside: ['Outside business', 'A purchase from an outside business can still be useful. The learning question is how value, ownership, and obligations may connect beyond a defined network.'],
    invest: ['Invest', 'Investment can create exposure to potential returns and risk. This lesson does not provide investment advice.'],
    give: ['Give', 'A gift can transfer value between people or organizations. The next effects depend on what the recipient does with it.']
  };
  root.querySelectorAll('input[name="l6-path"]').forEach((input) => input.addEventListener('change', async () => {
    const [title, copy] = paths[input.value];
    pathOutput.innerHTML = `<strong>$100 → ${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p>`;
    await markSection('follow-100');
  }));
  const renderAllocations = async () => {
    const inputs = [...root.querySelectorAll('[data-l6-allocation]')];
    const remainder = inputs.find((input) => input.dataset.l6Allocation === 'remainder');
    const adjustable = inputs.filter((input) => input !== remainder);
    let adjustableTotal = adjustable.reduce((sum, input) => sum + asNumber(input.value), 0);
    if (adjustableTotal > 100) {
      adjustable.forEach((input) => { input.value = ((asNumber(input.value) / adjustableTotal) * 100).toFixed(1); });
      adjustableTotal = adjustable.reduce((sum, input) => sum + asNumber(input.value), 0);
    }
    if (remainder) remainder.value = Math.max(0, 100 - adjustableTotal).toFixed(1);
    setStatus(root.querySelector('[data-l6-allocation-status]'), 'Illustrative allocations: 100% · reconciled automatically', 'success');
    await markSection('follow-100');
  };
  root.querySelectorAll('[data-l6-allocation]').forEach((input) => input.addEventListener('input', renderAllocations));
  renderAllocations();
}

function setupPrivateMap() {
  const form = document.querySelector('[data-l6-money-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l6-money-status]');
    if (!state.session) return requireAccount(status, '#follow-own-money');
    const data = new FormData(form);
    const response = {
      earned_source: String(data.get('earned_source') || '').trim(),
      spending_categories: data.getAll('category').map((category) => String(category)),
      consumption_payments: String(data.get('consumption_payments') || '').trim(),
      liability_payments: String(data.get('liability_payments') || '').trim(),
      asset_capability_payments: String(data.get('asset_capability_payments') || '').trim(),
      support_intentionally: String(data.get('support_intentionally') || '').trim(),
      replacement_opportunity: String(data.get('replacement_opportunity') || '').trim(),
      next_change: String(data.get('next_change') || '').trim()
    };
    if (!response.earned_source || !response.spending_categories.length || !response.consumption_payments || !response.asset_capability_payments || !response.next_change) return setStatus(status, 'Describe the source, select at least one destination category, and complete the required reflection prompts before saving.', 'error');
    const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'follow-own-money', response }, { onConflict: 'user_id,lesson_id,exercise_key' });
    if (!error) await markSection('follow-own-money');
    setStatus(status, error ? error.message : 'Your money map was saved privately.', error ? 'error' : 'success');
  });
}

async function setupQuiz() {
  const form = document.querySelector('[data-l6-quiz-form]');
  const holder = document.querySelector('[data-l6-quiz-questions]');
  if (!form || !holder || !state.lesson?.id) return;
  const { data, error } = await academySupabase.rpc('get_academy_lesson_quiz', { p_lesson_id: state.lesson.id });
  if (error || !Array.isArray(data)) { holder.innerHTML = '<p class="academy-status">The Knowledge Check is being prepared.</p>'; return; }
  holder.innerHTML = data.map((question, index) => `<fieldset><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${(question.choices || []).map((choice) => `<label><input type="radio" name="${escapeHtml(question.id)}" value="${escapeHtml(choice.id)}"> ${escapeHtml(choice.label)}</label>`).join('')}<p class="academy-feedback" data-l6-feedback="${escapeHtml(question.id)}"></p></fieldset>`).join('');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l6-quiz-status]');
    if (!state.session) return requireAccount(status, '#knowledge-check');
    const answers = Object.fromEntries(new FormData(form).entries());
    if (Object.keys(answers).length < data.length) return setStatus(status, `Answer all ${data.length} questions before submitting.`, 'error');
    const { data: result, error: submitError } = await academySupabase.rpc('submit_academy_quiz', { p_lesson_id: state.lesson.id, p_answers: answers });
    if (submitError) return setStatus(status, submitError.message, 'error');
    (result.feedback || []).forEach((item) => setStatus(form.querySelector(`[data-l6-feedback="${CSS.escape(item.id)}"]`), item.explanation, item.correct ? 'success' : ''));
    await markSection('knowledge-check');
    setStatus(status, result.passed ? `Passed: ${result.score}/${data.length} correct. Save your private money map, then record Lesson 6 completion.` : `Score: ${result.score}/${data.length}. Review the explanations and try again.`, result.passed ? 'success' : 'error');
  });
}

function setCompletedUI() {
  document.querySelector('[data-l6-complete]')?.classList.add('academy-hidden');
  document.querySelector('[data-l6-next]')?.classList.remove('academy-hidden');
  const heading = document.querySelector('[data-l6-completion-heading]');
  const copy = document.querySelector('[data-l6-completion-copy]');
  if (heading) heading.textContent = 'Lesson 6 completed';
  if (copy) copy.textContent = 'You can now trace income, ownership, debt, transactions, transfers, and community productive capacity without assuming that wealth always rises.';
  setStatus(document.querySelector('[data-l6-completion-status]'), 'COMPLETED ✓ Lesson 6 is saved. The pathway toward Lesson 7 is visible.', 'success');
}

function setupCompletion() {
  const button = document.querySelector('[data-l6-complete]');
  if (!button) return;
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-l6-completion-status]');
    if (!state.session) return requireAccount(status, '#complete');
    if (state.completed) return setCompletedUI();
    button.disabled = true;
    const { error } = await academySupabase.rpc('complete_academy_lesson6', { p_lesson_id: state.lesson.id });
    if (error) setStatus(status, error.message, 'error'); else { state.completed = true; setCompletedUI(); }
    button.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSession();
  try { await loadLesson(); } catch (_) { return; }
  observeSections();
  setupTransaction();
  setupFollow100();
  setupPrivateMap();
  await setupQuiz();
  setupCompletion();
});
