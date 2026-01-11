import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom storage adapter that works with SSR
// This ensures localStorage is used on the client, not during SSR
const customStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('[Supabase] localStorage.getItem failed:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('[Supabase] localStorage.setItem failed:', error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn('[Supabase] localStorage.removeItem failed:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto-detection of auth tokens in URL (for magic links)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use custom storage adapter that properly handles SSR
    storage: customStorageAdapter,
    flowType: 'pkce', // Use PKCE flow for better security
  }
})
