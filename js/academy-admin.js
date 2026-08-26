/* 7TRIBES LIFE ACADEMY — database-role-gated curriculum editors for published Academy lessons. */
import { academySupabase, academySession, academyRole } from './academy-supabase.js?v=role-scope-20260826';

const holders = [...document.querySelectorAll('[data-academy-admin-editor]')];
const lessons = {
  'follow-the-money': { number: '2', name: 'Follow the Money' },
  'how-work-actually-works': { number: '3', name: 'How Work Actually Works' },
  'how-business-actually-works': { number: '4', name: 'How Business Actually Works' },
  'how-ownership-actually-works': { number: '5', name: 'How Ownership Actually Works' },
  'how-wealth-transfers': { number: '6', name: 'How Wealth Transfers' },
};
const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const setStatus = (node, value, tone = '') => { if (node) { node.textContent = value; node.dataset.tone = tone; } };

function editorMarkup(lesson, quiz, config) {
  return `<div class="academy-eyebrow">Lesson ${config.number} content editor</div><h2>${escapeHtml(config.name)}</h2><p>Changes are available only to the existing founder role and are saved to the Academy curriculum tables. Learner records are not shown here.</p><form class="academy-admin-editor-form" data-academy-admin-form><label class="academy-field"><span>Lesson title</span><input name="title" value="${escapeHtml(lesson.title)}"></label><label class="academy-field"><span>Summary</span><textarea name="summary">${escapeHtml(lesson.summary || '')}</textarea></label><label class="academy-field"><span>Publication status</span><select name="status"><option value="draft" ${lesson.status === 'draft' ? 'selected' : ''}>Draft</option><option value="published" ${lesson.status === 'published' ? 'selected' : ''}>Published</option><option value="coming_soon" ${lesson.status === 'coming_soon' ? 'selected' : ''}>Coming Soon</option></select></label><label class="academy-field"><span>Sections, explanations, scenarios, diagrams, and exercise instructions (JSON)</span><textarea name="content" class="academy-json">${escapeHtml(JSON.stringify(lesson.lesson_content, null, 2))}</textarea></label><label class="academy-field"><span>Knowledge Check questions, choices, and answer explanations (JSON)</span><textarea name="questions" class="academy-json">${escapeHtml(JSON.stringify(quiz.questions, null, 2))}</textarea></label><label class="academy-field"><span>Knowledge Check answer key (JSON — founder only)</span><textarea name="answer_key" class="academy-json">${escapeHtml(JSON.stringify(quiz.answer_key, null, 2))}</textarea></label><label class="academy-field"><span>Passing score</span><input name="passing_score" type="number" min="0" value="${escapeHtml(quiz.passing_score)}"></label><button class="academy-button" type="submit">Save Lesson ${config.number} content</button><p class="academy-status" data-academy-admin-status aria-live="polite"></p></form>`;
}

async function setupEditor(holder, session, role) {
  const config = lessons[holder.dataset.adminLesson];
  if (!config) return;
  if (!session || !['admin', 'founder_admin'].includes(role)) { holder.innerHTML = `<p class="academy-status">Founder or administrator access is required to manage Lesson ${config.number}. This editor does not expose learner records.</p>`; return; }
  const { data: lesson, error: lessonError } = await academySupabase.from('academy_lessons').select('id,title,summary,status,lesson_content').eq('slug', holder.dataset.adminLesson).maybeSingle();
  if (lessonError || !lesson?.id) { holder.innerHTML = `<p class="academy-status">Lesson ${config.number} is not available for editing yet.</p>`; return; }
  const { data: quiz, error: quizError } = await academySupabase.from('academy_lesson_quizzes').select('questions,answer_key,passing_score').eq('lesson_id', lesson.id).maybeSingle();
  if (quizError || !quiz) { holder.innerHTML = `<p class="academy-status">Lesson ${config.number} quiz configuration is not available for editing yet.</p>`; return; }
  holder.innerHTML = editorMarkup(lesson, quiz, config);
  const form = holder.querySelector('[data-academy-admin-form]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const output = form.querySelector('[data-academy-admin-status]');
    let content; let questions; let answerKey;
    try { content = JSON.parse(data.get('content')); questions = JSON.parse(data.get('questions')); answerKey = JSON.parse(data.get('answer_key')); } catch (_) { return setStatus(output, 'Lesson content, questions, and answer key must each contain valid JSON.', 'error'); }
    if (!Array.isArray(questions) || !questions.length || !answerKey || typeof answerKey !== 'object') return setStatus(output, 'Provide at least one question and a valid answer-key object.', 'error');
    const { error: lessonSaveError } = await academySupabase.from('academy_lessons').update({ title: String(data.get('title') || '').trim(), summary: String(data.get('summary') || '').trim(), status: data.get('status'), lesson_content: content }).eq('id', lesson.id);
    if (lessonSaveError) return setStatus(output, lessonSaveError.message, 'error');
    const { error: quizSaveError } = await academySupabase.from('academy_lesson_quizzes').upsert({ lesson_id: lesson.id, questions, answer_key: answerKey, passing_score: Number(data.get('passing_score') || 0) }, { onConflict: 'lesson_id' });
    setStatus(output, quizSaveError ? quizSaveError.message : `Lesson ${config.number} curriculum and Knowledge Check saved. Publication status is now reflected in the Academy roadmap.`, quizSaveError ? 'error' : 'success');
  });
}

async function setupEditors() {
  if (!holders.length) return;
  const session = await academySession();
  const role = session ? await academyRole() : 'member';
  await Promise.all(holders.map((holder) => setupEditor(holder, session, role)));
}

document.addEventListener('DOMContentLoaded', () => setupEditors().catch(() => holders.forEach((holder) => { holder.innerHTML = '<p class="academy-status">Curriculum editing controls are unavailable.</p>'; })));
