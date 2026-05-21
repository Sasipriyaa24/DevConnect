import { supabase } from './supabase';

/**
 * getToken() — Returns the auth token for API calls.
 * 
 * WHY THIS EXISTS:
 * - Custom backend login stores token in localStorage as 'token'
 * - Google Auth (Supabase) stores the session internally
 * - This helper checks BOTH so API calls work regardless of login method
 */
export const getToken = async () => {
  // 1. Check for custom backend token first
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;

  // 2. Fall back to Supabase session token (Google Auth)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  } catch (err) {
    console.error('Error getting Supabase session:', err);
  }

  return null;
};
