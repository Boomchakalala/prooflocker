import { createBrowserClient } from '@supabase/ssr'
import { ENV, logWithEnv } from './env'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Log which Supabase project is being used
const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown';
logWithEnv(`Supabase client initialized: ${projectId}`);

// Use @supabase/ssr for Next.js - handles PKCE code verifier in cookies automatically
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
