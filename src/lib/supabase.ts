import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Temporarily allow app to run without Supabase for development
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables')
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto-detection of auth tokens in URL (for magic links)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use local storage for session persistence
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce', // Use PKCE flow for better security
  }
})
