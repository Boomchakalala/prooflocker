/**
 * Generate a consistent author number from userId
 * Uses simple hash to create deterministic 4-digit number
 */
export function generateAuthorNumber(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Return 4-digit number (1000-9999)
  return 1000 + Math.abs(hash % 9000);
}

/**
 * Format relative time (e.g., "2 minutes ago", "3 hours ago")
 * Falls back to UTC date for older timestamps
 * Handles both ISO timestamps and relative time strings
 */
export function formatRelativeTime(timestamp: string): string {
  // Handle invalid/empty timestamps
  if (!timestamp || timestamp.trim() === '') {
    return '—';
  }

  // If timestamp is already a relative string (like "2h ago", "3d ago"), return it
  if (/^\d+[smhd]\s+ago$/.test(timestamp.trim())) {
    return timestamp;
  }

  try {
    const now = new Date();
    const past = new Date(timestamp);

    // Check if date is valid
    if (isNaN(past.getTime())) {
      return '—';
    }

    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;

    return past.toLocaleDateString("en-US", { timeZone: "UTC" }) + " UTC";
  } catch (error) {
    // If any error occurs during parsing, return fallback
    return '—';
  }
}
