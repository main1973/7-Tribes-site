/* 7TRIBES LIFE ACADEMY — Browser-only Supabase client for GitHub Pages.
   The publishable key is safe in the browser; RLS is authoritative for private data. */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0?bundle';

export const ACADEMY_CONFIG = Object.freeze({
  url: 'https://dhawwokxkeurcmiemxbm.supabase.co',
  publishableKey: 'sb_publishable__kJVd_MIqVjknjdOjKzgSQ_GLdVlCc4',
  redirectTo: 'https://7trb.com/academy/'
});

export const academySupabase = createClient(ACADEMY_CONFIG.url, ACADEMY_CONFIG.publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export async function academySession() {
  const { data, error } = await academySupabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function academyRole() {
  try {
    const session = await academySession();
    const userId = session?.user?.id;
    if (!userId) return 'member';

    const { data, error } = await academySupabase
      .from('academy_user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data?.role) return 'member';
    return data.role;
  } catch {
    return 'member';
  }
}
