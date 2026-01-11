import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Convert Supabase error to user-friendly message
 */
function getFriendlyErrorMessage(error: any): string {
  const message = error?.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return 'Email or password is incorrect.';
  }

  if (message.includes('email not confirmed')) {
    return 'Your account needs email confirmation. Check your inbox or resend the confirmation email.';
  }

  if (message.includes('user already registered')) {
    return 'This email is already registered. Try signing in instead.';
  }

  if (message.includes('password')) {
    return 'Password must be at least 6 characters.';
  }

  // Return original message if no match
  return error?.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  user?: User;
  session?: any;
  needsEmailConfirmation?: boolean
}> {
  // Validate input
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  if (error) {
    console.error("[Auth] Error signing up:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }

  if (!data.user) {
    return { success: false, error: "Failed to create account. Please try again." };
  }

  // Check if email confirmation is needed
  const needsEmailConfirmation = !data.session;
  console.log("[Auth] Sign up successful. User:", data.user.id);
  console.log("[Auth] Session:", data.session ? "Active" : "Null (confirmation needed)");
  console.log("[Auth] Needs email confirmation:", needsEmailConfirmation);

  return {
    success: true,
    user: data.user,
    session: data.session,
    needsEmailConfirmation
  };
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  user?: User;
  session?: any;
  needsEmailConfirmation?: boolean
}> {
  // Validate input
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[Auth] Error signing in:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }

  if (!data.user || !data.session) {
    return { success: false, error: "Sign in failed. Please try again." };
  }

  console.log("[Auth] Sign in successful. User:", data.user.id);

  return {
    success: true,
    user: data.user,
    session: data.session,
    needsEmailConfirmation: false  // Sign-in always has a session
  };
}

/**
 * Resend confirmation email
 */
export async function resendConfirmationEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    }
  });

  if (error) {
    console.error("[Auth] Error resending confirmation:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }

  console.log("[Auth] Confirmation email resent to:", email);
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
