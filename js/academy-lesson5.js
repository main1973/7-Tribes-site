/* 7TRIBES LIFE ACADEMY — Lesson 5 keeps ownership education public while private learner reflection remains RLS-backed. */
import { academySupabase, academySession } from './academy-supabase.js';

const lessonSlug = 'how-ownership-actually-works';
const requiredSections = ['use-possession-control-ownership', 'assets', 'assets-liabilities', 'debt-ownership', 'business-ownership', 'ownership-percentages', 'ownership-income', 'infrastructure', 'ownership-ladder', 'collective-ownership', 'ownership-analyzer', 'map-control-own', 'knowledge-check'];
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
  const observer = new IntersectionObserver((entries) => entries.filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.35).forEach((entry) => markSection(entry.target.dataset.l5Section)), { threshold: [.35] });
  document.querySelectorAll('[data-l5-section]').forEach((node) => observer.observe(node));
}

function setupExamples() {
  const output = document.querySelector('[data-l5-example-feedback]');
  const examples = {
    renter: ['Apartment renter', 'A renter generally uses and possesses the apartment but does not own the real estate. Their rights may come from a lease or other agreement.'],
    'financed-car': ['Car owner with financing', 'A buyer may hold ownership rights while a lender also has a security interest until debt is satisfied, depending on applicable law and title arrangements. This can create layered rights and obligations.'],
    shareholder: ['Business shareholder', 'A shareholder owns an interest in the company, not each company asset personally. The entity may own or control the building, equipment, and contracts.'],
    subscriber: ['Subscription customer', 'A subscriber usually has access to a service but does not own the underlying platform, software, or infrastructure.']
  };
  document.querySelectorAll('[data-l5-example]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-l5-example]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
    const selected = examples[button.dataset.l5Example];
    output.innerHTML = `<strong>${escapeHtml(selected[0])}</strong><br>${escapeHtml(selected[1])}`;
    await markSection('use-possession-control-ownership');
  }));
}

function nonNegative(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function setupShares() {
  const root = document.querySelector('[data-l5-shares]');
  if (!root) return;
  const read = (key) => nonNegative(root.querySelector(`[data-l5-share="${key}"]`)?.value);
  const render = async () => {
    const shares = { founder: read('founder'), partner: read('partner'), investor: read('investor') };
    const total = Object.values(shares).reduce((sum, value) => sum + value, 0);
    Object.entries(shares).forEach(([key, value]) => {
      const node = root.querySelector(`[data-l5-percent="${key}"]`);
      if (node) node.textContent = `${total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'}%`;
    });
    setStatus(root.querySelector('[data-l5-share-status]'), total === 100 ? 'Total: 100 units' : `Total: ${total} units. Percentages are calculated from the entered total.`, total === 100 ? 'success' : '');
    await markSection('ownership-percentages');
  };
  root.querySelectorAll('[data-l5-share]').forEach((input) => input.addEventListener('input', render));
  render();
}

function setupInfrastructure() {
  const output = document.querySelector('[data-l5-infrastructure-output]');
  document.querySelectorAll('[data-l5-infrastructure]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-l5-infrastructure]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
    const item = button.dataset.l5Infrastructure;
    output.innerHTML = `<strong>${escapeHtml(item)}</strong><p>For this ${escapeHtml(item.toLowerCase())}, ask: Who owns it? Who operates it? Who works there? Who receives revenue and potential profit? Who makes major decisions? Where might the money eventually go?</p>`;
    await markSection('infrastructure');
  }));
}

function setupAnalyzer() {
  const form = document.querySelector('[data-l5-analyzer]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const output = form.querySelector('[data-l5-analyzer-output]');
    output.innerHTML = `<strong>Educational ownership summary: ${escapeHtml(data.asset_type)}</strong><p><b>Possession:</b> ${escapeHtml(data.possesses || 'Not specified')}<br><b>Legal ownership:</b> ${escapeHtml(data.legal_owner || 'Not specified')}<br><b>Debt:</b> ${escapeHtml(data.debt)}<br><b>Decision control:</b> ${escapeHtml(data.control || 'Not specified')}<br><b>Economic benefit:</b> ${escapeHtml(data.benefit || 'Not specified')}<br><b>Transfer:</b> ${escapeHtml(data.transfer)}<br><b>Other claims:</b> ${escapeHtml(data.claims || 'Not specified')}</p><p>This is an educational framework, not legal, financial, tax, title, or investment advice. The information you entered was not saved.</p>`;
    await markSection('ownership-analyzer');
  });
}

function createRelationshipFields() {
  const holder = document.querySelector('[data-l5-relationship-fields]');
  if (!holder) return;
  holder.innerHTML = Array.from({ length: 3 }, (_, index) => `<fieldset class="academy-relationship-item"><legend>Thing you use regularly ${index + 1}</legend><label class="academy-field"><span>Thing or resource</span><input name="item_${index}"></label><label class="academy-field"><span>Arrangement</span><select name="arrangement_${index}"><option value="">Choose one</option><option>Own</option><option>Rent</option><option>Lease</option><option>Subscribe to</option><option>Borrow</option><option>Share ownership</option><option>Another arrangement</option></select></label></fieldset>`).join('');
}

function setupPrivateMap() {
  const form = document.querySelector('[data-l5-control-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l5-control-status]');
    if (!state.session) return requireAccount(status, '#map-control-own');
    const formData = new FormData(form);
    const regularRelationships = Array.from({ length: 3 }, (_, index) => ({ item: String(formData.get(`item_${index}`) || '').trim(), arrangement: String(formData.get(`arrangement_${index}`) || '').trim() }));
    const response = {
      regular_relationships: regularRelationships,
      desired_asset: String(formData.get('desired_asset') || '').trim(),
      why_ownership_matters: String(formData.get('why_ownership_matters') || '').trim(),
      acquisition_resources: formData.getAll('resource').map((value) => String(value)),
      next_action: String(formData.get('next_action') || '').trim()
    };
    if (regularRelationships.some((entry) => !entry.item || !entry.arrangement) || !response.desired_asset || !response.why_ownership_matters || !response.acquisition_resources.length || !response.next_action) return setStatus(status, 'Complete all three relationships, select at least one resource, and answer every private reflection prompt before saving.', 'error');
    const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'map-control-own', response }, { onConflict: 'user_id,lesson_id,exercise_key' });
    if (!error) await markSection('map-control-own');
    setStatus(status, error ? error.message : 'Your ownership map was saved privately.', error ? 'error' : 'success');
  });
}

async function setupQuiz() {
  const form = document.querySelector('[data-l5-quiz-form]');
  const holder = document.querySelector('[data-l5-quiz-questions]');
  if (!form || !holder || !state.lesson?.id) return;
  const { data, error } = await academySupabase.rpc('get_academy_lesson_quiz', { p_lesson_id: state.lesson.id });
  if (error || !Array.isArray(data)) { holder.innerHTML = '<p class="academy-status">The Knowledge Check is being prepared.</p>'; return; }
  holder.innerHTML = data.map((question, index) => `<fieldset><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${(question.choices || []).map((choice) => `<label><input type="radio" name="${escapeHtml(question.id)}" value="${escapeHtml(choice.id)}"> ${escapeHtml(choice.label)}</label>`).join('')}<p class="academy-feedback" data-l5-feedback="${escapeHtml(question.id)}"></p></fieldset>`).join('');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l5-quiz-status]');
    if (!state.session) return requireAccount(status, '#knowledge-check');
    const answers = Object.fromEntries(new FormData(form).entries());
    if (Object.keys(answers).length < data.length) return setStatus(status, `Answer all ${data.length} questions before submitting.`, 'error');
    const { data: result, error: submitError } = await academySupabase.rpc('submit_academy_quiz', { p_lesson_id: state.lesson.id, p_answers: answers });
    if (submitError) return setStatus(status, submitError.message, 'error');
    (result.feedback || []).forEach((item) => setStatus(form.querySelector(`[data-l5-feedback="${CSS.escape(item.id)}"]`), item.explanation, item.correct ? 'success' : ''));
    await markSection('knowledge-check');
    setStatus(status, result.passed ? `Passed: ${result.score}/${data.length} correct. Save your private ownership map, then record Lesson 5 completion.` : `Score: ${result.score}/${data.length}. Review the explanations and try again.`, result.passed ? 'success' : 'error');
  });
}

function setCompletedUI() {
  document.querySelector('[data-l5-complete]')?.classList.add('academy-hidden');
  document.querySelector('[data-l5-next]')?.classList.remove('academy-hidden');
  const heading = document.querySelector('[data-l5-completion-heading]');
  const copy = document.querySelector('[data-l5-completion-copy]');
  if (heading) heading.textContent = 'Lesson 5 completed';
  if (copy) copy.textContent = 'You can now distinguish access, possession, control, ownership, assets, debt, and the structures that shape economic rights.';
  setStatus(document.querySelector('[data-l5-completion-status]'), 'COMPLETED ✓ Lesson 5 is saved. The pathway toward Lesson 6 is visible.', 'success');
}

function setupCompletion() {
  const button = document.querySelector('[data-l5-complete]');
  if (!button) return;
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-l5-completion-status]');
    if (!state.session) return requireAccount(status, '#complete');
    if (state.completed) return setCompletedUI();
    button.disabled = true;
    const { error } = await academySupabase.rpc('complete_academy_lesson5', { p_lesson_id: state.lesson.id });
    if (error) setStatus(status, error.message, 'error'); else { state.completed = true; setCompletedUI(); }
    button.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSession();
  try { await loadLesson(); } catch (_) { return; }
  createRelationshipFields();
  observeSections();
  setupExamples();
  setupShares();
  setupInfrastructure();
  setupAnalyzer();
  setupPrivateMap();
  await setupQuiz();
  setupCompletion();
});
