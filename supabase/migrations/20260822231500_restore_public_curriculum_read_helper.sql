-- Published Academy curriculum policies call is_academy_founder() alongside status checks.
-- The helper returns false when auth.uid() is null and exposes no role or learner data.

begin;

grant execute on function public.is_academy_founder() to anon, authenticated;

commit;
