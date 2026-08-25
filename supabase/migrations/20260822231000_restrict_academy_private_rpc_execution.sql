-- Remove anonymous execution from private Academy SECURITY DEFINER RPCs.
-- Public quiz prompts remain intentionally available through get_academy_lesson_quiz.

begin;

revoke all on function public.complete_academy_lesson(uuid) from public, anon;
grant execute on function public.complete_academy_lesson(uuid) to authenticated;

revoke all on function public.complete_academy_lesson2(uuid) from public, anon;
grant execute on function public.complete_academy_lesson2(uuid) to authenticated;

revoke all on function public.track_academy_lesson_section(uuid, text) from public, anon;
grant execute on function public.track_academy_lesson_section(uuid, text) to authenticated;

revoke all on function public.submit_academy_quiz(uuid, jsonb) from public, anon;
grant execute on function public.submit_academy_quiz(uuid, jsonb) to authenticated;

revoke all on function public.get_7tribes_account_overview() from public, anon;
grant execute on function public.get_7tribes_account_overview() to authenticated;

revoke all on function public.academy_founder_metrics() from public, anon;
grant execute on function public.academy_founder_metrics() to authenticated;

revoke all on function public.academy_founder_recent_learners() from public, anon;
grant execute on function public.academy_founder_recent_learners() to authenticated;

revoke all on function public.set_academy_user_role(uuid, public.academy_role) from public, anon;
grant execute on function public.set_academy_user_role(uuid, public.academy_role) to authenticated;

revoke all on function public.handle_new_academy_user() from public, anon, authenticated;

revoke all on function public.is_academy_founder() from public, anon;
grant execute on function public.is_academy_founder() to authenticated;

-- This function returns published prompt/choice payload only; it never returns answer keys.
revoke all on function public.get_academy_lesson_quiz(uuid) from public;
grant execute on function public.get_academy_lesson_quiz(uuid) to anon, authenticated;

commit;
