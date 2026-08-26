/* 7TRIBES LIFE ACADEMY — Lesson 3 public education with authenticated RLS-backed private work only. */
import { academySupabase, academySession } from './academy-supabase.js';

const lessonSlug = 'how-work-actually-works';
const requiredSections = ['basic-exchange','economic-positions','active-leverage','ownership-result','ownership-ladder','work-audit','capability-challenge','knowledge-check'];
const state = { session: null, lesson: null, viewed: new Set(), completed: false };
const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const setStatus = (node, value, tone = '') => { if (node) { node.textContent = value; node.dataset.tone = tone; } };

function requireAccount(status, anchor) {
  const returnTo = `${location.pathname}${anchor || location.hash || ''}`;
  if (status) { status.dataset.tone = 'error'; status.innerHTML = `Save your progress <a href="/account/signup.html?returnTo=${encodeURIComponent(returnTo)}">Create a free 7Tribes account</a> to continue your Life Academy journey and return where you left off. <a href="/account/login.html?returnTo=${encodeURIComponent(returnTo)}">Log In</a>`; }
}

async function loadSession() { try { state.session = await academySession(); } catch (_) { state.session = null; } document.documentElement.dataset.academyAuth = state.session ? 'signed-in' : 'signed-out'; }
async function loadLesson() {
  const { data, error } = await academySupabase.from('academy_lessons').select('id,title,status').eq('slug', lessonSlug).maybeSingle();
  if (error) throw error; state.lesson = data;
  if (state.session && data?.id) {
    const { data: completion } = await academySupabase.from('academy_completions').select('completed_at').eq('lesson_id', data.id).maybeSingle();
    state.completed = Boolean(completion?.completed_at); if (state.completed) setCompletedUI();
  }
}
async function markSection(section) {
  if (!state.session || !state.lesson?.id || state.viewed.has(section)) return;
  state.viewed.add(section); await academySupabase.rpc('track_academy_lesson_section', { p_lesson_id: state.lesson.id, p_section: section });
}
function observeSections() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => entries.filter((entry) => entry.isIntersecting && entry.intersectionRatio > .35).forEach((entry) => markSection(entry.target.dataset.l3Section)), { threshold: [.35] });
  document.querySelectorAll('[data-l3-section]').forEach((node) => observer.observe(node));
}
function setupScenarios() {
  document.querySelectorAll('.academy-scenario[data-l3-scenario]').forEach((scenario) => {
    const feedback = scenario.querySelector('[data-l3-scenario-feedback]');
    scenario.querySelectorAll('[data-l3-option]').forEach((button) => button.addEventListener('click', async () => {
      scenario.querySelectorAll('[data-l3-option]').forEach((item) => { item.setAttribute('aria-pressed', String(item === button)); item.disabled = true; });
      setStatus(feedback, button.dataset.feedback, button.dataset.correct === 'true' ? 'success' : ''); await markSection(scenario.dataset.l3Scenario);
      if (!state.session || !state.lesson?.id) return;
      const { error } = await academySupabase.from('academy_scenario_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, scenario_key: scenario.dataset.l3Scenario, selected_option: button.dataset.l3Option }, { onConflict: 'user_id,lesson_id,scenario_key' });
      if (error) setStatus(feedback, 'Your feedback is visible, but the private response could not be saved. Please try again.', 'error');
    }));
  });
}
function setupLeverage() {
  const output = document.querySelector('[data-l3-leverage-output]');
  const copy = { active: ['Active income','Work → payment. Examples include hourly wages, salary, freelance work, and personal services.'], leveraged: ['Leveraged or system-based income','Build or own a system → the system can serve multiple transactions → revenue. Examples can include software, employees operating a process, licensing, equipment, or distribution.'] };
  document.querySelectorAll('[data-l3-leverage]').forEach((button) => button.addEventListener('click', async () => { document.querySelectorAll('[data-l3-leverage]').forEach((node) => node.setAttribute('aria-pressed', String(node === button))); const selected = copy[button.dataset.l3Leverage]; output.innerHTML = `<strong>${escapeHtml(selected[0])}</strong><p>${escapeHtml(selected[1])}</p>`; await markSection('active-leverage'); }));
}
function setupLadder() {
  const feedback = document.querySelector('[data-l3-ladder-feedback]');
  document.querySelectorAll('[data-l3-level]').forEach((button) => button.addEventListener('click', async () => { document.querySelectorAll('[data-l3-level]').forEach((node) => node.setAttribute('aria-pressed', String(node === button))); setStatus(feedback, 'Economic leverage describes a relationship between effort and productive capacity—not a measure of human value.', 'success'); await markSection('ownership-ladder'); }));
}
function setupWorkAudit() {
  const form = document.querySelector('[data-l3-work-form]'); if (!form) return;
  form.addEventListener('submit', async (event) => { event.preventDefault(); const status = form.querySelector('[data-l3-work-status]'); if (!state.session) return requireAccount(status, '#work-audit'); const data = new FormData(form); const response = { primary_income: String(data.get('primary_income') || ''), income_exchange: String(data.get('income_exchange') || ''), continuity: String(data.get('continuity') || ''), assets: data.getAll('assets'), skill_to_scale: String(data.get('skill_to_scale') || '').trim() }; if (!response.primary_income || !response.income_exchange || !response.continuity || !response.assets.length || !response.skill_to_scale) return setStatus(status, 'Complete each field and select at least one asset or system. “None yet” is a valid selection.', 'error'); const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'work-audit', response }, { onConflict: 'user_id,lesson_id,exercise_key' }); if (!error) await markSection('work-audit'); setStatus(status, error ? error.message : 'Your work audit was saved privately.', error ? 'error' : 'success'); });
}
function setupCapability() {
  const form = document.querySelector('[data-l3-capability-form]'); if (!form) return;
  form.addEventListener('submit', async (event) => { event.preventDefault(); const status = form.querySelector('[data-l3-capability-status]'); if (!state.session) return requireAccount(status, '#capability-challenge'); const data = new FormData(form); const response = Object.fromEntries(['skill','who_needs','direct_sale','repeatable_system','asset_tool','first_step'].map((key) => [key, String(data.get(key) || '').trim()])); if (Object.values(response).some((value) => !value)) return setStatus(status, 'Complete every field before saving this private capability challenge.', 'error'); const { error } = await academySupabase.from('academy_lesson_exercise_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, exercise_key: 'labor-to-capability', response }, { onConflict: 'user_id,lesson_id,exercise_key' }); if (!error) await markSection('capability-challenge'); setStatus(status, error ? error.message : 'Your capability challenge was saved privately.', error ? 'error' : 'success'); });
}
async function setupQuiz() {
  const form = document.querySelector('[data-l3-quiz-form]'); const holder = document.querySelector('[data-l3-quiz-questions]'); if (!form || !holder || !state.lesson?.id) return;
  const { data, error } = await academySupabase.rpc('get_academy_lesson_quiz', { p_lesson_id: state.lesson.id }); if (error || !Array.isArray(data)) { holder.innerHTML = '<p class="academy-status">The Knowledge Check is being prepared.</p>'; return; }
  holder.innerHTML = data.map((question, index) => `<fieldset><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${(question.choices || []).map((choice) => `<label><input type="radio" name="${escapeHtml(question.id)}" value="${escapeHtml(choice.id)}"> ${escapeHtml(choice.label)}</label>`).join('')}<p class="academy-feedback" data-l3-feedback="${escapeHtml(question.id)}"></p></fieldset>`).join('');
  form.addEventListener('submit', async (event) => { event.preventDefault(); const status = form.querySelector('[data-l3-quiz-status]'); if (!state.session) return requireAccount(status, '#knowledge-check'); const answers = Object.fromEntries(new FormData(form).entries()); if (Object.keys(answers).length < data.length) return setStatus(status, `Answer all ${data.length} questions before submitting.`, 'error'); const { data: result, error: submitError } = await academySupabase.rpc('submit_academy_quiz', { p_lesson_id: state.lesson.id, p_answers: answers }); if (submitError) return setStatus(status, submitError.message, 'error'); (result.feedback || []).forEach((item) => setStatus(form.querySelector(`[data-l3-feedback="${CSS.escape(item.id)}"]`), item.explanation, item.correct ? 'success' : '')); await markSection('knowledge-check'); setStatus(status, result.passed ? `Passed: ${result.score}/${data.length} correct. Complete the capability challenge to finish Lesson 3.` : `Score: ${result.score}/${data.length}. Review the explanations and try again.`, result.passed ? 'success' : 'error'); });
}
function setCompletedUI() { document.querySelector('[data-l3-complete]')?.classList.add('academy-hidden'); document.querySelector('[data-l3-next]')?.classList.remove('academy-hidden'); const heading = document.querySelector('[data-l3-completion-heading]'); const copy = document.querySelector('[data-l3-completion-copy]'); if (heading) heading.textContent = 'Lesson 3 completed'; if (copy) copy.textContent = 'Now you understand the difference between working inside a system and owning or controlling productive capacity.'; setStatus(document.querySelector('[data-l3-completion-status]'), 'COMPLETED ✓ Lesson 3 is saved. Lesson 4 is now available.', 'success'); }
function setupCompletion() { const button = document.querySelector('[data-l3-complete]'); if (!button) return; button.addEventListener('click', async () => { const status = document.querySelector('[data-l3-completion-status]'); if (!state.session) return requireAccount(status, '#complete'); if (state.completed) return setCompletedUI(); button.disabled = true; const { error } = await academySupabase.rpc('complete_academy_lesson3', { p_lesson_id: state.lesson.id }); if (error) setStatus(status, error.message, 'error'); else { state.completed = true; setCompletedUI(); } button.disabled = false; }); }
document.addEventListener('DOMContentLoaded', async () => { await loadSession(); try { await loadLesson(); } catch (_) { return; } observeSections(); setupScenarios(); setupLeverage(); setupLadder(); setupWorkAudit(); setupCapability(); await setupQuiz(); setupCompletion(); });
