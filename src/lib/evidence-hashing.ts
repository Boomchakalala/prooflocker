/**
 * Evidence Integrity and Hashing Utilities
 *
 * Provides SHA-256 hashing functions for evidence items and resolution fingerprints
 * to ensure integrity and immutability.
 */

import type { ResolutionFingerprintPayload } from "./evidence-types";

/**
 * Compute SHA-256 hash of a string
 */
export async function sha256(message: string): Promise<string> {
  // Use Web Crypto API (works in browser and Node.js 15+)
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  // Fallback for older Node.js (should not happen in modern Next.js)
  throw new Error("Web Crypto API not available");
}

/**
 * Compute SHA-256 hash of a File (browser only)
 */
export async function sha256File(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Compute SHA-256 hash of a File (server-side with Node.js crypto)
 */
export async function sha256FileServer(fileBuffer: Buffer): Promise<string> {
  const crypto = await import("crypto");
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
}

/**
 * Normalize URL for consistent hashing
 * Removes trailing slashes, converts to lowercase, sorts query params
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Convert to lowercase
    const protocol = urlObj.protocol.toLowerCase();
    const hostname = urlObj.hostname.toLowerCase();
    let pathname = urlObj.pathname.toLowerCase();

    // Remove trailing slash from pathname (unless it's just "/")
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // Sort query parameters alphabetically
    const params = new URLSearchParams(urlObj.search);
    const sortedParams = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
    const sortedSearch = sortedParams.length > 0
      ? "?" + sortedParams.map(([k, v]) => `${k}=${v}`).join("&")
      : "";

    // Reconstruct normalized URL
    const normalized = `${protocol}//${hostname}${pathname}${sortedSearch}`;
    return normalized;
  } catch (error) {
    // If URL parsing fails, return original (will fail validation elsewhere)
    return url;
  }
}

/**
 * Compute SHA-256 hash of a normalized URL
 */
export async function sha256Url(url: string): Promise<string> {
  const normalized = normalizeUrl(url);
  return sha256(normalized);
}

/**
 * Compute resolution fingerprint hash
 * Creates a canonical JSON representation and hashes it
 */
export async function computeResolutionFingerprint(
  payload: ResolutionFingerprintPayload
): Promise<string> {
  // Sort evidence item hashes to ensure deterministic ordering
  const sortedHashes = [...payload.evidenceItemHashes].sort();

  // Create canonical JSON with sorted keys
  const canonical = JSON.stringify({
    evidenceGrade: payload.evidenceGrade,
    evidenceItemHashes: sortedHashes,
    evidenceSummary: payload.evidenceSummary || "",
    outcome: payload.outcome,
    predictionId: payload.predictionId,
    resolvedAt: payload.resolvedAt,
  });

  // Hash the canonical JSON
  return sha256(canonical);
}

/**
 * Truncate hash for display (show first and last parts)
 */
export function truncateHash(hash: string, prefixLen: number = 8, suffixLen: number = 8): string {
  if (hash.length <= prefixLen + suffixLen + 3) {
    return hash;
  }
  return `${hash.substring(0, prefixLen)}...${hash.substring(hash.length - suffixLen)}`;
}

/**
 * Validate that a string is a valid SHA-256 hash (64 hex characters)
 */
export function isValidSha256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Format hash for display with copy functionality
 */
export function formatHashForDisplay(hash: string): {
  full: string;
  truncated: string;
  prefix: string;
  suffix: string;
} {
  return {
    full: hash,
    truncated: truncateHash(hash, 16, 6),
    prefix: hash.substring(0, 16),
    suffix: hash.substring(hash.length - 6),
  };
}
