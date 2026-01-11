/**
 * Admin utilities for ProofLocker
 * Centralized admin role checking based on ADMIN_EMAILS environment variable
 */

import type { User } from "@supabase/supabase-js";

/**
 * Get list of admin emails from environment variable
 * Format: comma-separated list, e.g. "admin@example.com,kevin@example.com"
 */
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";

  if (!adminEmailsEnv) {
    console.warn("[Admin] No ADMIN_EMAILS configured. No users will have admin access.");
    return [];
  }

  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Check if a user is an admin
 * @param user - Supabase user object
 * @returns true if user's email is in ADMIN_EMAILS list
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) {
    return false;
  }

  const adminEmails = getAdminEmails();
  const userEmail = user.email.trim().toLowerCase();

  return adminEmails.includes(userEmail);
}

/**
 * Check if an email is an admin email
 * @param email - Email address to check
 * @returns true if email is in ADMIN_EMAILS list
 */
export function isAdminEmail(email: string): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = getAdminEmails();
  const checkEmail = email.trim().toLowerCase();

  return adminEmails.includes(checkEmail);
}

/**
 * Assert that current user is admin, throw error if not
 * @param user - Supabase user object
 * @throws Error if user is not admin
 */
export function requireAdmin(user: User | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error("Unauthorized: Admin access required");
  }
}

/**
 * Get admin status and email list (for debugging/display)
 * @param user - Supabase user object
 * @returns Object with admin status and configured emails
 */
export function getAdminInfo(user: User | null | undefined): {
  isAdmin: boolean;
  userEmail: string | null;
  adminEmails: string[];
} {
  return {
    isAdmin: isAdmin(user),
    userEmail: user?.email || null,
    adminEmails: getAdminEmails(),
  };
}
