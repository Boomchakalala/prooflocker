/**
 * Public handle utilities for anonymous identity
 * ProofLocker uses "Anon #XXXX" format for all public displays
 */

import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Generate a unique public handle in "Anon #XXXX" format
 * @returns Promise<string> - e.g., "Anon #4556"
 */
export async function generatePublicHandle(): Promise<string> {
  // Generate random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `Anon #${randomNum}`;
}

/**
 * Get or generate public handle for a user
 * Ensures every user has a stable anonymous identity
 * @param user - Supabase user object
 * @returns string - Public handle (e.g., "Anon #4556")
 */
export function getPublicHandle(user: User | null | undefined): string {
  if (!user) {
    return "Anonymous";
  }

  // Check if user already has a public_handle in metadata
  const existingHandle = user.user_metadata?.public_handle;

  if (existingHandle && typeof existingHandle === "string" && existingHandle.startsWith("Anon #")) {
    return existingHandle;
  }

  // Fallback: generate from user ID (for backward compatibility)
  // This ensures consistent handle even if metadata isn't set yet
  const userId = user.id;
  const numericHash = parseInt(userId.replace(/\D/g, "").slice(0, 8), 10);
  const fourDigit = 1000 + (numericHash % 9000);
  return `Anon #${fourDigit}`;
}

/**
 * Set public handle for a user (stores in user_metadata)
 * This should be called once during signup or first claim
 * @param handle - The public handle to set (e.g., "Anon #4556")
 * @returns Promise<boolean> - Success status
 */
export async function setPublicHandle(handle: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        public_handle: handle,
      },
    });

    if (error) {
      console.error("[PublicHandle] Error setting handle:", error);
      return false;
    }

    console.log("[PublicHandle] ✓ Set handle:", handle);
    return true;
  } catch (error) {
    console.error("[PublicHandle] Exception setting handle:", error);
    return false;
  }
}

/**
 * Ensure user has a public handle (generate and set if missing)
 * Safe to call multiple times - only generates if needed
 * @param user - Supabase user object
 * @returns Promise<string> - The user's public handle
 */
export async function ensurePublicHandle(user: User): Promise<string> {
  // Check if user already has a handle
  const existingHandle = user.user_metadata?.public_handle;

  if (existingHandle && typeof existingHandle === "string" && existingHandle.startsWith("Anon #")) {
    return existingHandle;
  }

  // Generate new handle
  const newHandle = await generatePublicHandle();

  // Save to user metadata
  await setPublicHandle(newHandle);

  return newHandle;
}

/**
 * Get display name for any context
 * NEVER shows email - always returns anonymous handle
 * @param user - Supabase user object
 * @returns string - Anonymous public handle
 */
export function getDisplayName(user: User | null | undefined): string {
  return getPublicHandle(user);
}
