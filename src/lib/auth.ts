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
  try {
    // Add a timeout to prevent hanging - reduced to 500ms for faster page loads
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn("[Auth] getUser() timed out after 500ms, continuing without auth");
        resolve(null);
      }, 500);
    });

    const getUserPromise = supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("[Auth] Error getting current user:", error);
        return null;
      }
      return user;
    });

    // Race between the actual call and the timeout
    const user = await Promise.race([getUserPromise, timeoutPromise]);
    return user;
  } catch (error) {
    console.error("[Auth] Exception in getCurrentUser:", error);
    return null;
  }
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
