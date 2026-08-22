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
  const { data, error } = await academySupabase.rpc('is_academy_founder');
  if (error) return 'learner';
  return data === true ? 'founder_admin' : 'learner';
}

export async function sendAcademyMagicLink(email, displayName) {
  const options = { emailRedirectTo: ACADEMY_CONFIG.redirectTo };
  if (displayName) options.data = { display_name: displayName };
  const { error } = await academySupabase.auth.signInWithOtp({ email, options });
  if (error) throw error;
}
