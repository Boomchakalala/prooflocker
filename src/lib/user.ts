/**
 * Anonymous user ID management
 * Generates and stores a persistent UUID in localStorage
 * Future-proof: can be linked to real accounts later
 */

const USER_ID_KEY = "prooflocker-user-id";
const USER_TYPE_KEY = "prooflocker-user-type";

// Simple UUID v4 generator
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create an anonymous user ID
 * Stored in localStorage for persistence across sessions
 */
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") {
    // Server-side rendering fallback
    return "";
  }

  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // Generate new UUID for anonymous user
    userId = generateUUID();
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(USER_TYPE_KEY, "anonymous");
  }

  return userId;
}

/**
 * Get user type (anonymous or authenticated)
 * Future-proof for when we add account linking
 */
export function getUserType(): "anonymous" | "authenticated" {
  if (typeof window === "undefined") {
    return "anonymous";
  }

  const userType = localStorage.getItem(USER_TYPE_KEY);
  return userType === "authenticated" ? "authenticated" : "anonymous";
}

/**
 * Check if user is anonymous
 */
export function isAnonymousUser(): boolean {
  return getUserType() === "anonymous";
}

/**
 * Future: Link anonymous predictions to a real account
 * This function is a placeholder for future implementation
 */
export function linkToAccount(accountId: string): void {
  if (typeof window === "undefined") return;

  const anonymousUserId = localStorage.getItem(USER_ID_KEY);

  if (anonymousUserId) {
    // Store mapping for migration
    localStorage.setItem("prooflocker-previous-id", anonymousUserId);
    localStorage.setItem(USER_ID_KEY, accountId);
    localStorage.setItem(USER_TYPE_KEY, "authenticated");

    // In the future, call an API endpoint to migrate predictions
    // migratePredictions(anonymousUserId, accountId);
  }
}

/**
 * Clear user data (for testing or logout)
 */
export function clearUserData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
  localStorage.removeItem("prooflocker-previous-id");
}
