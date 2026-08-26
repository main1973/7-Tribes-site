/* 7TRIBES LIFE ACADEMY — Single Module V1 roadmap with private learning interactions.
   Private work persists only through Supabase RLS-backed tables. */
import { academySupabase, academySession, academyRole } from './academy-supabase.js?v=role-scope-20260826';

const lessonKey = 'understand-the-system';
const state = { session: null, role: 'learner', lesson: null, capabilitySaved: false, quizPassed: false, completed: false };

function message(node, text, tone) { if (!node) return; node.textContent = text; node.dataset.tone = tone || ''; }
function setText(selector, value) { const node = document.querySelector(selector); if (node) node.textContent = value; }
function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }

function requireAccount(status, anchor) {
  const returnTo = `${location.pathname}${anchor || location.hash || ''}`;
  if (status) {
    status.dataset.tone = 'error';
    status.innerHTML = `Save your progress <a href="/account/signup.html?returnTo=${encodeURIComponent(returnTo)}">Create a free 7Tribes account</a> to continue your Life Academy journey and return where you left off. <a href="/account/login.html?returnTo=${encodeURIComponent(returnTo)}">Log In</a>`;
  }
}

async function touchLessonProgress(currentSection) {
  if (!state.session || !state.lesson?.id) return;
  await academySupabase.from('academy_lesson_progress').upsert({
    user_id: state.session.user.id,
    lesson_id: state.lesson.id,
    current_section: currentSection,
    last_seen_at: new Date().toISOString()
  }, { onConflict: 'user_id,lesson_id' });
}

function setCompletedLessonUI(completed) {
  if (!completed) return;
  const button = document.querySelector('[data-complete-lesson]');
  const continueLink = document.querySelector('[data-continue-lesson]');
  const heading = document.querySelector('[data-completion-heading]');
  const copy = document.querySelector('[data-completion-copy]');
  const status = document.querySelector('[data-completion-status]');
  if (button) button.classList.add('academy-hidden');
  if (continueLink) continueLink.classList.remove('academy-hidden');
  if (heading) heading.textContent = 'Lesson 1 completed';
  if (copy) copy.textContent = 'Your completion is saved privately. Continue when you are ready—your completed lesson, quiz, and capability response will remain intact.';
  message(status, 'COMPLETED ✓ Lesson 1 is saved. Continue to Lesson 2 when you are ready.', 'success');
}

async function loadSessionUI() {
  try {
    state.session = await academySession();
    state.role = state.session ? await academyRole() : 'learner';
  } catch (_) { state.session = null; state.role = 'learner'; }
  document.documentElement.dataset.academyAuth = state.session ? 'signed-in' : 'signed-out';
  document.documentElement.dataset.academyRole = state.role;
  document.querySelectorAll('[data-academy-auth-only]').forEach((node) => node.classList.toggle('academy-hidden', !state.session));
  document.querySelectorAll('[data-academy-guest-only]').forEach((node) => node.classList.toggle('academy-hidden', !!state.session));
  setText('[data-academy-user-label]', state.session?.user?.email || 'Guest learner');
  const adminLink = document.querySelector('[data-academy-admin-link]');
  if (adminLink) adminLink.classList.toggle('academy-hidden', !['admin', 'founder_admin'].includes(state.role));
}

function setupScenario() {
  document.querySelectorAll('[data-scenario]').forEach((scenario) => {
    const feedback = scenario.querySelector('[data-scenario-feedback]');
    scenario.querySelectorAll('[data-scenario-option]').forEach((button) => button.addEventListener('click', async () => {
      scenario.querySelectorAll('[data-scenario-option]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      message(feedback, button.dataset.feedback, button.dataset.correct === 'true' ? 'success' : '');
      if (!state.session || !state.lesson?.id) return;
      await academySupabase.from('academy_scenario_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, scenario_key: scenario.dataset.scenario, selected_option: button.dataset.option }, { onConflict: 'user_id,lesson_id,scenario_key' });
      await touchLessonProgress('scenario');
    }));
  });
}

async function loadLessonRecord() {
  const { data, error } = await academySupabase.from('academy_lessons').select('id,title,lesson_content,status').eq('slug', lessonKey).maybeSingle();
  if (error) throw error;
  state.lesson = data;
  if (state.session && data?.id) {
    const { data: completion } = await academySupabase
      .from('academy_completions')
      .select('completed_at')
      .eq('lesson_id', data.id)
      .maybeSingle();
    state.completed = Boolean(completion?.completed_at);
    if (state.completed) setCompletedLessonUI(true);
    await touchLessonProgress('opening');
  }
  return data;
}

async function loadLandingRoadmap() {
  const lessons = [
    { slug: 'understand-the-system', selector: '[data-lesson-one-status]', label: 'Lesson 1, Who Actually Runs What?' },
    { slug: 'follow-the-money', selector: '[data-lesson-two-status]', label: 'Lesson 2, Follow the Money' },
    { slug: 'how-work-actually-works', selector: '[data-lesson-three-status]', label: 'Lesson 3, How Work Actually Works' },
    { slug: 'how-business-actually-works', selector: '[data-lesson-four-status]', label: 'Lesson 4, How Business Actually Works' },
    { slug: 'how-ownership-actually-works', selector: '[data-lesson-five-status]', label: 'Lesson 5, How Ownership Actually Works' }
  ];
  await Promise.all(lessons.map(async (entry) => {
    const statusNode = document.querySelector(entry.selector);
    if (!statusNode) return;
    const { data: lesson, error } = await academySupabase.from('academy_lessons').select('id').eq('slug', entry.slug).maybeSingle();
    if (error || !lesson?.id || !state.session) return;
    const [{ data: completion }, { data: progress }] = await Promise.all([
      academySupabase.from('academy_completions').select('lesson_id').eq('lesson_id', lesson.id).maybeSingle(),
      academySupabase.from('academy_lesson_progress').select('lesson_id').eq('lesson_id', lesson.id).maybeSingle()
    ]);
    const label = completion ? 'Completed ✓' : progress ? 'In Progress' : 'Available';
    statusNode.textContent = label;
    statusNode.setAttribute('aria-label', `${label}: ${entry.label}`);
  }));
}

function setupCapability() {
  const form = document.querySelector('[data-capability-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-capability-status]');
    if (!state.session) return requireAccount(status, '#capability');
    if (!state.lesson?.id) return message(status, 'Lesson records are being prepared. Your response was not saved.', 'error');
    const response = { system_to_understand: form.querySelector('[name="system_to_understand"]').value.trim(), strength_to_contribute: form.querySelector('[name="strength_to_contribute"]').value.trim() };
    if (!response.system_to_understand || !response.strength_to_contribute) return message(status, 'Answer both prompts before saving.', 'error');
    const { error } = await academySupabase.from('academy_capability_responses').upsert({ user_id: state.session.user.id, lesson_id: state.lesson.id, response }, { onConflict: 'user_id,lesson_id' });
    if (error) return message(status, error.message, 'error');
    state.capabilitySaved = true;
    message(status, 'Saved privately to your Capability Profile.', 'success');
    const profile = {
      user_id: state.session.user.id,
      community_strengths: [response.strength_to_contribute],
      interests: [response.system_to_understand],
      collaboration_preferences: response.strength_to_contribute
    };
    await academySupabase.from('academy_capability_profiles').upsert(profile, { onConflict: 'user_id' });
    await touchLessonProgress('capability-exercise');
  });
}

function setupQuiz() {
  const form = document.querySelector('[data-quiz-form]');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-quiz-status]');
    if (!state.session) return requireAccount(status, '#knowledge-check');
    if (!state.lesson?.id) return message(status, 'Lesson records are being prepared. Quiz results are not stored yet.', 'error');
    const answers = Object.fromEntries(new FormData(form).entries());
    if (Object.keys(answers).length < 3) return message(status, 'Answer all three questions before submitting.', 'error');
    const { data, error } = await academySupabase.rpc('submit_academy_quiz', { p_lesson_id: state.lesson.id, p_answers: answers });
    if (error) return message(status, error.message, 'error');
    state.quizPassed = data.passed === true;
    message(status, data.passed ? `Passed: ${data.score}/3 correct. Complete your capability exercise to finish Lesson 1.` : `Score: ${data.score}/3. Review the lesson and try again.`, data.passed ? 'success' : 'error');
    await touchLessonProgress('knowledge-check');
  });
}

function setupCompletion() {
  const button = document.querySelector('[data-complete-lesson]');
  if (!button) return;
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-completion-status]');
    if (!state.session) return requireAccount(status, '#complete');
    if (!state.lesson?.id) return message(status, 'Lesson records are being prepared.', 'error');
    if (state.completed) return setCompletedLessonUI(true);
    button.disabled = true;
    const { error } = await academySupabase.rpc('complete_academy_lesson', { p_lesson_id: state.lesson.id });
    if (error) {
      message(status, error.message, 'error');
    } else {
      state.completed = true;
      setCompletedLessonUI(true);
    }
    button.disabled = false;
  });
}

async function setupAdmin() {
  const holder = document.querySelector('[data-founder-console]');
  if (!holder) return;
  if (!state.session || !['admin', 'founder_admin'].includes(state.role)) { holder.innerHTML = '<p class="academy-status">Founder or administrator access is required. This page does not expose learner records to other users.</p>'; return; }
  const [{ data, error }, { data: learners, error: learnerError }] = await Promise.all([
    academySupabase.rpc('academy_founder_metrics'),
    academySupabase.rpc('academy_founder_recent_learners')
  ]);
  if (error || !data?.[0]) { holder.innerHTML = '<p class="academy-status">Founder metrics are unavailable.</p>'; return; }
  const metrics = data[0];
  const learnerList = !learnerError && learners?.length
    ? `<ul class="academy-admin-list">${learners.map((learner) => `<li><strong>${escapeHtml(learner.display_name || 'Private learner')}</strong><span>${learner.completion_count} completion${learner.completion_count === 1 ? '' : 's'} · ${new Date(learner.joined_at).toLocaleDateString()}</span></li>`).join('')}</ul>`
    : '<p class="academy-status">No learner records yet. Metrics remain true zero until real activity exists.</p>';
  holder.innerHTML = `<div class="academy-admin-grid"><div class="academy-stat"><strong>${metrics.learner_count}</strong><span>Learners</span></div><div class="academy-stat"><strong>${metrics.completion_count}</strong><span>Lesson completions</span></div><div class="academy-stat"><strong>${metrics.capability_response_count}</strong><span>Capability responses</span></div><div class="academy-stat"><strong>${metrics.published_lesson_count}</strong><span>Published lessons</span></div></div><section class="academy-admin-section"><h2>Recent learners</h2>${learnerList}</section><p class="academy-status">Metrics are based only on real Academy records. Founder review is role-gated by Supabase RLS; no learner record is exposed to other users.</p>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSessionUI();
  if (document.body.dataset.academyPage === 'landing') await loadLandingRoadmap();
  setupScenario(); setupCapability(); setupQuiz(); setupCompletion();
  if (document.body.dataset.academyPage === 'lesson') { try { await loadLessonRecord(); } catch (_) {} }
  if (document.body.dataset.academyPage === 'admin') await setupAdmin();
});
