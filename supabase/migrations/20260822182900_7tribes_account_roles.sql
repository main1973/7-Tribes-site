-- Must run in its own migration/transaction before role-aware functions use these values.
alter type public.academy_role add value if not exists 'member';
alter type public.academy_role add value if not exists 'admin';
