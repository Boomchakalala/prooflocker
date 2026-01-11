/**
 * Get the canonical site URL
 * Returns the production URL in production, or localhost in development
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  );
}

/**
 * Get an absolute URL for a given path
 * @param path - The path to append to the site URL (should start with /)
 */
export function getAbsoluteUrl(path: string): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}${path}`;
}
