/* 7TRIBES LIFE ACADEMY — Lesson 4 preserves public education while sending private learner work only to RLS-backed Academy tables. */
import { academySupabase, academySession } from './academy-supabase.js';

const lessonSlug = 'how-business-actually-works';
const requiredSections = ['business-problem', 'revenue-profit', 'money-flow', 'sales-ownership', 'tshirt-supply-chain', 'system-self-employment', 'dependency-exercise', 'local-multiplier', 'business-dashboard', 'map-real-business', 'knowledge-check'];
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
  const observer = new IntersectionObserver((entries) => entries.filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.35).forEach((entry) => markSection(entry.target.dataset.l4Section)), { threshold: [.35] });
  document.querySelectorAll('[data-l4-section]').forEach((node) => observer.observe(node));
}

function setupScenarios() {
  document.querySelectorAll('.academy-scenario[data-l4-scenario]').forEach((scenario) => {
    const feedback = scenario.querySelector('[data-l4-scenario-feedback]');
    scenario.querySelectorAll('[data-l4-option]').forEach((button) => button.addEventListener('click', async () => {
      scenario.querySelectorAll('[data-l4-option]').forEach((item) => { item.setAttribute('aria-pressed', String(item === button)); item.disabled = true; });
      setStatus(feedback, button.dataset.feedback, button.dataset.correct === 'true' ? 'success' : '');
      await markSection(scenario.dataset.l4Scenario);
      if (!state.session || !state.lesson?.id) return;
      const { error } = await academySupabase.from('academy_scenario_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, scenario_key: scenario.dataset.l4Scenario, selected_option: button.dataset.l4Option }, { onConflict: 'user_id,lesson_id,scenario_key' });
      if (error) setStatus(feedback, 'Your feedback is visible, but the private response could not be saved. Please try again.', 'error');
    }));
  });
}

function setupMoneyFlow() {
  const output = document.querySelector('[data-l4-money-output]');
  const content = {
    employees: ['Employees', 'Wages, benefits, payroll administration, training, and staffing can be major operating commitments.'],
    suppliers: ['Suppliers', 'Inputs, inventory, materials, professional services, and distribution can all receive a share of business revenue.'],
    property: ['Landlord or property', 'Rent, a mortgage, maintenance, and property-related costs can be necessary to keep operations available.'],
    utilities: ['Utilities', 'Power, water, communications, and other utilities can be essential to delivering a product or service.'],
    insurance: ['Insurance', 'Insurance may help manage specific risks, but it is an operating cost that varies by business and coverage.'],
    technology: ['Technology', 'Software, hardware, internet services, platforms, and security can support delivery, operations, and customer access.'],
    marketing: ['Marketing', 'Customer awareness and acquisition can require spending on outreach, sales, relationships, or advertising.'],
    lenders: ['Lenders', 'Borrowed capital can help finance assets or operations, while repayment and interest can become obligations.'],
    government: ['Government or tax obligations', 'Businesses can face applicable taxes, licenses, compliance costs, and other public obligations that vary by situation.'],
    owners: ['Owners or reinvestment', 'What remains may be retained for inventory, reserves, equipment, growth, debt reduction, owner compensation, or other future decisions.']
  };
  document.querySelectorAll('[data-l4-money]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-l4-money]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
    const selected = content[button.dataset.l4Money];
    output.innerHTML = `<strong>${escapeHtml(selected[0])}</strong><p>${escapeHtml(selected[1])}</p>`;
    await markSection('money-flow');
  }));
}

function setupDependencies() {
  const output = document.querySelector('[data-l4-dependency-output]');
  document.querySelectorAll('[data-l4-dependency]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-l4-dependency]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
    const dependency = button.dataset.l4Dependency;
    output.innerHTML = `<strong>${escapeHtml(dependency)}</strong><p>Ask: Is this critical to daily delivery? Does the business own, control, rent, license, or merely access it? What alternative, reserve, relationship, contract, or contingency would reduce disruption if access changes?</p>`;
    await markSection('dependency-exercise');
  }));
}

function amount(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatCurrency(value) {
  const prefix = value < 0 ? '−' : '';
  return `${prefix}$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function setupSimulator() {
  const root = document.querySelector('[data-l4-simulator]');
  if (!root) return;
  const read = (key) => amount(root.querySelector(`[data-l4-sim="${key}"]`)?.value);
  const write = (key, value) => { const node = root.querySelector(`[data-l4-metric="${key}"]`); if (node) node.textContent = value; };
  const calculate = async () => {
    const customers = read('customers');
    const averageSale = read('average-sale');
    const costPerSale = read('cost-per-sale');
    const fixedExpenses = read('fixed-expenses');
    const laborExpense = read('labor-expense');
    const revenue = customers * averageSale;
    const variableCosts = customers * costPerSale;
    const totalExpenses = variableCosts + fixedExpenses + laborExpense;
    const operatingResult = revenue - totalExpenses;
    const operatingMargin = revenue > 0 ? (operatingResult / revenue) * 100 : 0;
    write('revenue', formatCurrency(revenue));
    write('variable-costs', formatCurrency(variableCosts));
    write('total-expenses', formatCurrency(totalExpenses));
    write('operating-result', formatCurrency(operatingResult));
    write('operating-margin', `${operatingMargin.toFixed(1)}%`);
    await markSection('business-dashboard');
  };
  root.querySelectorAll('[data-l4-sim]').forEach((input) => input.addEventListener('input', calculate));
  calculate();
}

function createExpenseFields() {
  const holder = document.querySelector('[data-l4-expense-fields]');
  if (!holder) return;
  holder.innerHTML = Array.from({ length: 5 }, (_, index) => `<label class="academy-field"><span>Likely expense ${index + 1}</span><input name="expense_${index}" placeholder="For example: labor, materials, rent, software, insurance"></label>`).join('');
}

function setupBusinessMap() {
  const form = document.querySelector('[data-l4-business-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l4-business-status]');
    if (!state.session) return requireAccount(status, '#map-real-business');
    const formData = new FormData(form);
    const response = Object.fromEntries(['business', 'offers', 'customers', 'revenue', 'suppliers', 'owned_assets', 'rented_resources', 'supplier_disruption', 'dollar_path', 'resilience'].map((key) => [key, String(formData.get(key) || '').trim()]));
    response.likely_expenses = Array.from({ length: 5 }, (_, index) => String(formData.get(`expense_${index}`) || '').trim());
    if (Object.values(response).some((value) => !Array.isArray(value) && !value) || response.likely_expenses.some((value) => !value)) return setStatus(status, 'Complete each field and all five likely expenses before saving this private business map.', 'error');
    const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'map-real-business', response }, { onConflict: 'user_id,lesson_id,exercise_key' });
    if (!error) await markSection('map-real-business');
    setStatus(status, error ? error.message : 'Your business map was saved privately.', error ? 'error' : 'success');
  });
}

async function setupQuiz() {
  const form = document.querySelector('[data-l4-quiz-form]');
  const holder = document.querySelector('[data-l4-quiz-questions]');
  if (!form || !holder || !state.lesson?.id) return;
  const { data, error } = await academySupabase.rpc('get_academy_lesson_quiz', { p_lesson_id: state.lesson.id });
  if (error || !Array.isArray(data)) { holder.innerHTML = '<p class="academy-status">The Knowledge Check is being prepared.</p>'; return; }
  holder.innerHTML = data.map((question, index) => `<fieldset><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${(question.choices || []).map((choice) => `<label><input type="radio" name="${escapeHtml(question.id)}" value="${escapeHtml(choice.id)}"> ${escapeHtml(choice.label)}</label>`).join('')}<p class="academy-feedback" data-l4-feedback="${escapeHtml(question.id)}"></p></fieldset>`).join('');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-l4-quiz-status]');
    if (!state.session) return requireAccount(status, '#knowledge-check');
    const answers = Object.fromEntries(new FormData(form).entries());
    if (Object.keys(answers).length < data.length) return setStatus(status, `Answer all ${data.length} questions before submitting.`, 'error');
    const { data: result, error: submitError } = await academySupabase.rpc('submit_academy_quiz', { p_lesson_id: state.lesson.id, p_answers: answers });
    if (submitError) return setStatus(status, submitError.message, 'error');
    (result.feedback || []).forEach((item) => setStatus(form.querySelector(`[data-l4-feedback="${CSS.escape(item.id)}"]`), item.explanation, item.correct ? 'success' : ''));
    await markSection('knowledge-check');
    setStatus(status, result.passed ? `Passed: ${result.score}/${data.length} correct. Save your private business map, then record Lesson 4 completion.` : `Score: ${result.score}/${data.length}. Review the explanations and try again.`, result.passed ? 'success' : 'error');
  });
}

function setCompletedUI() {
  document.querySelector('[data-l4-complete]')?.classList.add('academy-hidden');
  document.querySelector('[data-l4-next]')?.classList.remove('academy-hidden');
  const heading = document.querySelector('[data-l4-completion-heading]');
  const copy = document.querySelector('[data-l4-completion-copy]');
  if (heading) heading.textContent = 'Lesson 4 completed';
  if (copy) copy.textContent = 'You can now distinguish revenue from profit, trace business dependencies, and inspect how a business system creates and distributes value.';
  setStatus(document.querySelector('[data-l4-completion-status]'), 'COMPLETED ✓ Lesson 4 is saved. The pathway toward Lesson 5 is now visible.', 'success');
}

function setupCompletion() {
  const button = document.querySelector('[data-l4-complete]');
  if (!button) return;
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-l4-completion-status]');
    if (!state.session) return requireAccount(status, '#complete');
    if (state.completed) return setCompletedUI();
    button.disabled = true;
    const { error } = await academySupabase.rpc('complete_academy_lesson4', { p_lesson_id: state.lesson.id });
    if (error) setStatus(status, error.message, 'error'); else { state.completed = true; setCompletedUI(); }
    button.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSession();
  try { await loadLesson(); } catch (_) { return; }
  createExpenseFields();
  observeSections();
  setupScenarios();
  setupMoneyFlow();
  setupDependencies();
  setupSimulator();
  setupBusinessMap();
  await setupQuiz();
  setupCompletion();
});
