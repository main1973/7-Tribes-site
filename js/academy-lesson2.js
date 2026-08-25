/* 7TRIBES LIFE ACADEMY — Lesson 2 public learning with authenticated, RLS-backed private work only. */
import { academySupabase, academySession, academyRole } from './academy-supabase.js';

const lessonSlug = 'follow-the-money';
const requiredSections = ['gross-pay', 'spend-money', 'revenue-profit', 'hundred-journey', 'circulation', 'two-communities', 'trade', 'bread', 'supply-chain', 'capability-gap', 'knowledge-check'];
const journeyPaths = {
  labor: ['$30 · Labor', 'Restaurant', 'Employee', 'Grocery Store', 'Supplier'],
  suppliers: ['$20 · Suppliers', 'Restaurant', 'Local supplier', 'Delivery company', 'Worker'],
  utilities: ['$15 · Utilities', 'Restaurant', 'Utility provider', 'Workers and equipment'],
  taxes: ['$10 · Taxes', 'Restaurant', 'Public revenue', 'Services and obligations'],
  outside: ['$10 · Outside suppliers', 'Restaurant', 'Outside supplier', 'Leaves the defined community'],
  operating: ['$10 · Other operating expenses', 'Restaurant', 'Operating services', 'Workers and vendors'],
  profit: ['$5 · Profit', 'Restaurant', 'Owner or retained business funds', 'Future decisions']
};

const state = { session: null, role: 'member', lesson: null, viewed: new Set(), quiz: null };
const text = (node, value, tone = '') => { if (node) { node.textContent = value; node.dataset.tone = tone; } };
const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

function requireAccount(status, anchor) {
  const returnTo = `${location.pathname}${anchor || location.hash || ''}`;
  if (status) {
    status.dataset.tone = 'error';
    status.innerHTML = `Save your progress <a href="/account/signup.html?returnTo=${encodeURIComponent(returnTo)}">Create a free 7Tribes account</a> to continue your Life Academy journey and return where you left off. <a href="/account/login.html?returnTo=${encodeURIComponent(returnTo)}">Log In</a>`;
  }
}

async function loadSession() {
  try { state.session = await academySession(); state.role = state.session ? await academyRole() : 'member'; } catch (_) { state.session = null; state.role = 'member'; }
  document.documentElement.dataset.academyAuth = state.session ? 'signed-in' : 'signed-out';
}

async function loadLesson() {
  const { data, error } = await academySupabase.from('academy_lessons').select('id,title,lesson_content,status').eq('slug', lessonSlug).maybeSingle();
  if (error) throw error;
  state.lesson = data;
}

async function markSection(section) {
  if (!state.session || !state.lesson?.id || state.viewed.has(section)) return;
  state.viewed.add(section);
  await academySupabase.rpc('track_academy_lesson_section', { p_lesson_id: state.lesson.id, p_section: section });
}

function observeSections() {
  const nodes = [...document.querySelectorAll('[data-l2-section]')];
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.35).forEach((entry) => markSection(entry.target.dataset.l2Section));
  }, { threshold: [0.35] });
  nodes.forEach((node) => observer.observe(node));
}

function setupScenarios() {
  document.querySelectorAll('[data-l2-scenario]').forEach((scenario) => {
    const feedback = scenario.querySelector('[data-l2-scenario-feedback]');
    scenario.querySelectorAll('[data-l2-scenario-option]').forEach((button) => button.addEventListener('click', async () => {
      scenario.querySelectorAll('[data-l2-scenario-option]').forEach((item) => { item.setAttribute('aria-pressed', 'false'); item.disabled = true; });
      button.setAttribute('aria-pressed', 'true');
      text(feedback, button.dataset.feedback, button.dataset.correct === 'true' ? 'success' : '');
      await markSection(scenario.dataset.l2Scenario);
      if (!state.session || !state.lesson?.id) return;
      const { error } = await academySupabase.from('academy_scenario_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, scenario_key: scenario.dataset.l2Scenario, selected_option: button.dataset.option }, { onConflict: 'user_id,lesson_id,scenario_key' });
      if (error) text(feedback, 'Your feedback is still visible, but the private response could not be saved. Please try again.', 'error');
    }));
  });
}

function setupJourney() {
  const path = document.querySelector('[data-l2-journey-path]');
  const status = document.querySelector('[data-l2-journey-status]');
  document.querySelectorAll('[data-l2-journey-option]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-l2-journey-option]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
    const journey = journeyPaths[button.dataset.allocation];
    path.innerHTML = `<ol>${journey.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
    await markSection('hundred-journey');
    if (!state.session) return requireAccount(status, '#hundred-journey');
    const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'hundred-journey', response: { selected_allocation: button.dataset.allocation, path: journey } }, { onConflict: 'user_id,lesson_id,exercise_key' });
    text(status, error ? error.message : 'Your selected illustrative path was saved privately.', error ? 'error' : 'success');
  }));
}

function createSupplyItems() {
  const holder = document.querySelector('[data-l2-supply-items]');
  if (!holder) return;
  holder.innerHTML = Array.from({ length: 5 }, (_, index) => `<fieldset class="supply-item"><legend>Purchase ${index + 1}</legend><label class="academy-field"><span>Product or service</span><input name="product_${index}" placeholder="Product, service, or Unknown / I do not know"></label><label class="academy-field"><span>Where purchased</span><input name="purchased_${index}" placeholder="Business, seller, or Unknown / I do not know"></label><label class="academy-field"><span>Where produced, if known</span><input name="produced_${index}" placeholder="Location or Unknown / I do not know"></label><label class="academy-field"><span>Could any part reasonably be provided locally?</span><select name="local_${index}"><option value="unknown">Unknown / I do not know</option><option value="yes">Possibly</option><option value="no">Not currently clear</option></select></label><label class="academy-field"><span>Skills or equipment that might be required</span><textarea name="requirements_${index}" placeholder="Skills, workers, equipment, resources, or Unknown / I do not know"></textarea></label></fieldset>`).join('');
}

function setupSupplyChain() {
  const form = document.querySelector('[data-l2-supply-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l2-supply-status]');
    if (!state.session) return requireAccount(status, '#supply-chain');
    const formData = new FormData(form);
    const items = Array.from({ length: 5 }, (_, index) => ({
      product_service: String(formData.get(`product_${index}`) || '').trim(),
      where_purchased: String(formData.get(`purchased_${index}`) || '').trim(),
      where_produced: String(formData.get(`produced_${index}`) || '').trim(),
      local_potential: String(formData.get(`local_${index}`) || 'unknown'),
      requirements: String(formData.get(`requirements_${index}`) || '').trim()
    }));
    if (items.some((item) => !item.product_service || !item.where_purchased || !item.where_produced || !item.requirements)) return text(status, 'Complete all five entries. “Unknown / I do not know” is a valid response.', 'error');
    const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'supply-chain', response: { items } }, { onConflict: 'user_id,lesson_id,exercise_key' });
    if (!error) await markSection('supply-chain');
    text(status, error ? error.message : 'Five supply-chain entries were saved privately.', error ? 'error' : 'success');
  });
}

function setupCapabilityGap() {
  const form = document.querySelector('[data-l2-gap-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l2-gap-status]');
    if (!state.session) return requireAccount(status, '#capability-gap');
    const formData = new FormData(form);
    const response = { product_service: String(formData.get('product_service') || '').trim(), missing: formData.getAll('missing'), what_changes: String(formData.get('what_changes') || '').trim() };
    if (!response.product_service || !response.what_changes || !response.missing.length) return text(status, 'Name a product or service, select at least one possible missing factor, and describe what might have to change.', 'error');
    const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'capability-gap', response }, { onConflict: 'user_id,lesson_id,exercise_key' });
    if (!error) await markSection('capability-gap');
    text(status, error ? error.message : 'Your capability-gap response was saved privately.', error ? 'error' : 'success');
  });
}

async function setupQuiz() {
  const form = document.querySelector('[data-l2-quiz-form]');
  const holder = document.querySelector('[data-l2-quiz-questions]');
  if (!form || !holder || !state.lesson?.id) return;
  const { data, error } = await academySupabase.rpc('get_academy_lesson_quiz', { p_lesson_id: state.lesson.id });
  if (error || !Array.isArray(data)) { holder.innerHTML = '<p class="academy-status">The Knowledge Check is being prepared.</p>'; return; }
  state.quiz = data;
  holder.innerHTML = data.map((question, index) => `<fieldset><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${(question.choices || []).map((choice) => `<label><input type="radio" name="${escapeHtml(question.id)}" value="${escapeHtml(choice.id)}"> ${escapeHtml(choice.label)}</label>`).join('')}<p class="academy-feedback" data-l2-quiz-feedback="${escapeHtml(question.id)}"></p></fieldset>`).join('');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l2-quiz-status]');
    if (!state.session) return requireAccount(status, '#knowledge-check');
    const answers = Object.fromEntries(new FormData(form).entries());
    if (Object.keys(answers).length < data.length) return text(status, `Answer all ${data.length} questions before submitting.`, 'error');
    const { data: result, error: submitError } = await academySupabase.rpc('submit_academy_quiz', { p_lesson_id: state.lesson.id, p_answers: answers });
    if (submitError) return text(status, submitError.message, 'error');
    (result.feedback || []).forEach((feedback) => text(form.querySelector(`[data-l2-quiz-feedback="${CSS.escape(feedback.id)}"]`), feedback.explanation, feedback.correct ? 'success' : ''));
    await markSection('knowledge-check');
    text(status, result.passed ? `Passed: ${result.score}/${data.length} correct. Complete the required private exercises to finish Lesson 2.` : `Score: ${result.score}/${data.length}. Read the explanations and try again.`, result.passed ? 'success' : 'error');
  });
}

function setupCompletion() {
  const button = document.querySelector('[data-l2-complete]');
  if (!button) return;
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-l2-completion-status]');
    if (!state.session) return requireAccount(status, '#complete');
    button.disabled = true;
    const { error } = await academySupabase.rpc('complete_academy_lesson2', { p_lesson_id: state.lesson.id });
    text(status, error ? error.message : 'Lesson 2 complete. You now know how to look beyond a transaction and follow the economic system underneath it.', error ? 'error' : 'success');
    button.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSession();
  try { await loadLesson(); } catch (_) { return; }
  createSupplyItems(); observeSections(); setupScenarios(); setupJourney(); setupSupplyChain(); setupCapabilityGap(); await setupQuiz(); setupCompletion();
});
