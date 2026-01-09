import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Safe storage wrapper that catches localStorage errors
function getSafeStorage() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    // Test if we can actually use localStorage
    const testKey = '__supabase_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    console.warn('[Supabase] localStorage not available, sessions will not persist:', error);
    return undefined;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto-detection of auth tokens in URL (for magic links)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use safe storage wrapper
    storage: getSafeStorage(),
    flowType: 'pkce', // Use PKCE flow for better security
  }
})
