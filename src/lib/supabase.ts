import { createClient } from '@supabase/supabase-js'
import { ENV, logWithEnv } from './env'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// On server side, prefer service role key for API access
// On client side, use anon key
const isServer = typeof window === 'undefined';
const supabaseKey = isServer
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time, use placeholder values to avoid build errors
// The actual values will be injected at runtime by Vercel
const finalUrl = supabaseUrl || (isBuildTime ? 'https://placeholder.supabase.co' : undefined);
const finalKey = supabaseKey || (isBuildTime ? 'placeholder-key' : undefined);

if (!finalUrl || !finalKey) {
  throw new Error('Missing Supabase environment variables')
}

// Log which Supabase project is being used (only at runtime)
if (!isBuildTime && supabaseUrl) {
  const projectId = finalUrl.split('//')[1]?.split('.')[0] || 'unknown';
  logWithEnv(`Supabase client initialized: ${projectId}`);
}

// Use implicit flow instead of PKCE to avoid cookie issues in preview environments
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    flowType: 'implicit', // Use implicit flow - tokens in URL, no code verifier needed
    autoRefreshToken: true,
    persistSession: !isServer,
    detectSessionInUrl: !isServer,
  }
})
