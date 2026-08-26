-- Restrict private Academy completion RPCs to authenticated learners.
-- This repair changes function grants only; it does not alter curriculum or learner records.

begin;

revoke execute on function public.complete_academy_lesson3(uuid) from anon;
revoke execute on function public.complete_academy_lesson4(uuid) from anon;
grant execute on function public.complete_academy_lesson3(uuid) to authenticated;
grant execute on function public.complete_academy_lesson4(uuid) to authenticated;

commit;
