/**
 * User display utilities
 * Format user information for UI display with privacy in mind
 */

import type { User } from "@supabase/supabase-js";

/**
 * Get a short, privacy-friendly display label for a user
 * Prefers user_metadata.full_name, falls back to email prefix
 * Max 14 characters with ellipsis
 *
 * Examples:
 * - "John Doe" → "John Doe"
 * - "kevin.odea22@gmail.com" → "kevin.odea"
 * - "verylongemailaddress@example.com" → "verylongemail..."
 */
export function getUserDisplayLabel(user: User | null | undefined): string {
  if (!user) {
    return "Anonymous";
  }

  // Try full_name from user_metadata first
  const fullName = user.user_metadata?.full_name;
  if (fullName && typeof fullName === "string" && fullName.trim().length > 0) {
    const trimmed = fullName.trim();
    if (trimmed.length <= 14) {
      return trimmed;
    }
    return trimmed.substring(0, 14) + "...";
  }

  // Fall back to email prefix (part before @)
  if (user.email) {
    const emailPrefix = user.email.split("@")[0];
    if (emailPrefix.length <= 14) {
      return emailPrefix;
    }
    return emailPrefix.substring(0, 14) + "...";
  }

  return "User";
}

/**
 * Get user's email (safely)
 */
export function getUserEmail(user: User | null | undefined): string | null {
  return user?.email || null;
}

/**
 * Get initials from user name or email
 * Examples:
 * - "John Doe" → "JD"
 * - "kevin.odea@gmail.com" → "KO"
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) {
    return "AN"; // Anonymous
  }

  const fullName = user.user_metadata?.full_name;
  if (fullName && typeof fullName === "string") {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
  }

  if (user.email) {
    const emailPrefix = user.email.split("@")[0];
    if (emailPrefix.length >= 2) {
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return emailPrefix[0].toUpperCase() + "U";
  }

  return "U";
}
