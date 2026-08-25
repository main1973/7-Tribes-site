/* 7TRIBES LIFE ACADEMY — Founder-only Lesson 2 content editor within the existing Academy admin surface. */
import { academySupabase, academySession, academyRole } from './academy-supabase.js';

const holder = document.querySelector('[data-l2-admin-editor]');
const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
function status(node, value, tone = '') { if (node) { node.textContent = value; node.dataset.tone = tone; } }

function editorMarkup(lesson, quiz) {
  return `<div class="academy-eyebrow">Lesson 2 content editor</div><h2>Follow the Money</h2><p>Changes are available only to the existing founder role and are saved to the existing Academy curriculum tables.</p><form class="academy-admin-editor-form" data-l2-admin-form><label class="academy-field"><span>Lesson title</span><input name="title" value="${escapeHtml(lesson.title)}"></label><label class="academy-field"><span>Summary</span><textarea name="summary">${escapeHtml(lesson.summary || '')}</textarea></label><label class="academy-field"><span>Publication status</span><select name="status"><option value="draft" ${lesson.status === 'draft' ? 'selected' : ''}>Draft</option><option value="published" ${lesson.status === 'published' ? 'selected' : ''}>Published</option><option value="coming_soon" ${lesson.status === 'coming_soon' ? 'selected' : ''}>Coming Soon</option></select></label><label class="academy-field"><span>Sections, explanations, scenarios, diagrams, and exercise instructions (JSON)</span><textarea name="content" class="academy-json">${escapeHtml(JSON.stringify(lesson.lesson_content, null, 2))}</textarea></label><label class="academy-field"><span>Knowledge Check questions, choices, and answer explanations (JSON)</span><textarea name="questions" class="academy-json">${escapeHtml(JSON.stringify(quiz.questions, null, 2))}</textarea></label><label class="academy-field"><span>Knowledge Check answer key (JSON — founder only)</span><textarea name="answer_key" class="academy-json">${escapeHtml(JSON.stringify(quiz.answer_key, null, 2))}</textarea></label><label class="academy-field"><span>Passing score</span><input name="passing_score" type="number" min="0" value="${escapeHtml(quiz.passing_score)}"></label><button class="academy-button" type="submit">Save Lesson 2 content</button><p class="academy-status" data-l2-admin-status></p></form>`;
}

async function setupEditor() {
  if (!holder) return;
  const session = await academySession();
  const role = session ? await academyRole() : 'member';
  if (!session || !['admin', 'founder_admin'].includes(role)) { holder.innerHTML = '<p class="academy-status">Founder or administrator access is required to manage Lesson 2. This editor does not expose learner records.</p>'; return; }
  const { data: lesson, error: lessonError } = await academySupabase.from('academy_lessons').select('id,title,summary,status,lesson_content').eq('slug', 'follow-the-money').maybeSingle();
  if (lessonError || !lesson?.id) { holder.innerHTML = '<p class="academy-status">Lesson 2 is not available for editing yet.</p>'; return; }
  const { data: quiz, error: quizError } = await academySupabase.from('academy_lesson_quizzes').select('questions,answer_key,passing_score').eq('lesson_id', lesson.id).maybeSingle();
  if (quizError || !quiz) { holder.innerHTML = '<p class="academy-status">Lesson 2 quiz configuration is not available for editing yet.</p>'; return; }
  holder.innerHTML = editorMarkup(lesson, quiz);
  const form = holder.querySelector('[data-l2-admin-form]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const output = form.querySelector('[data-l2-admin-status]');
    let content; let questions; let answerKey;
    try { content = JSON.parse(formData.get('content')); questions = JSON.parse(formData.get('questions')); answerKey = JSON.parse(formData.get('answer_key')); } catch (_) { return status(output, 'Lesson content, questions, and answer key must each contain valid JSON.', 'error'); }
    if (!Array.isArray(questions) || !questions.length || typeof answerKey !== 'object' || !answerKey) return status(output, 'Provide at least one question and a valid answer-key object.', 'error');
    const { error: lessonSaveError } = await academySupabase.from('academy_lessons').update({ title: String(formData.get('title') || '').trim(), summary: String(formData.get('summary') || '').trim(), status: formData.get('status'), lesson_content: content }).eq('id', lesson.id);
    if (lessonSaveError) return status(output, lessonSaveError.message, 'error');
    const { error: quizSaveError } = await academySupabase.from('academy_lesson_quizzes').upsert({ lesson_id: lesson.id, questions, answer_key: answerKey, passing_score: Number(formData.get('passing_score') || 0) }, { onConflict: 'lesson_id' });
    status(output, quizSaveError ? quizSaveError.message : 'Lesson 2 curriculum and Knowledge Check saved. Publication status is now reflected in the Academy roadmap.', quizSaveError ? 'error' : 'success');
  });
}

document.addEventListener('DOMContentLoaded', () => setupEditor().catch(() => { if (holder) holder.innerHTML = '<p class="academy-status">Lesson 2 editing controls are unavailable.</p>'; }));
