import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a Supabase client for use in Server Components and API Routes
 * This client reads the session from cookies
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  // Get all Supabase-related cookies
  const authCookies = cookieStore.getAll()
    .filter(cookie => cookie.name.startsWith('sb-'))
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ')

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: authCookies
      }
    }
  })
}
