import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Send a magic link to the user's email
 */
export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  if (error) {
    console.error("[Auth] Error sending magic link:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[Auth] Error getting current user:", error);
    return null;
  }

  return user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[Auth] Error signing out:", error);
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}
