/**
 * OSINT Signal Types
 *
 * Types for OSINT (Open Source Intelligence) signals from external APIs.
 * These provide read-only context for user claims.
 */

export interface OsintSignal {
  id: string;
  createdAt: string;

  // Content
  title: string;
  content?: string;

  // Source attribution
  sourceName: string;      // "Reuters", "BBC", "@conflict_radar"
  sourceHandle?: string;   // Twitter handle
  sourceUrl: string;       // Article/tweet URL

  // Geolocation
  geotagLat?: number;
  geotagLng?: number;
  locationName?: string;   // "Tehran, Iran"

  // Categorization
  tags: string[];          // ["conflict", "iran", "breaking"]
  category?: string;       // "Politics", "Markets", etc.

  // Timestamps
  publishedAt: string;
  ingestedAt: string;

  // Metadata
  externalId?: string;     // API source ID
  confidenceScore?: number; // 0-100
}

/**
 * Database row format (snake_case)
 */
export interface OsintSignalRow {
  id: string;
  created_at: string;
  title: string;
  content?: string;
  source_name: string;
  source_handle?: string;
  source_url: string;
  geotag_lat?: number;
  geotag_lng?: number;
  location_name?: string;
  tags: string[];
  category?: string;
  published_at: string;
  ingested_at: string;
  external_id?: string;
  confidence_score?: number;
}

/**
 * Convert database row to domain object
 */
export function mapOsintSignalFromDb(row: OsintSignalRow): OsintSignal {
  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    content: row.content,
    sourceName: row.source_name,
    sourceHandle: row.source_handle,
    sourceUrl: row.source_url,
    geotagLat: row.geotag_lat,
    geotagLng: row.geotag_lng,
    locationName: row.location_name,
    tags: row.tags || [],
    category: row.category,
    publishedAt: row.published_at,
    ingestedAt: row.ingested_at,
    externalId: row.external_id,
    confidenceScore: row.confidence_score,
  };
}

/**
 * Convert domain object to database row
 */
export function mapOsintSignalToDb(signal: Omit<OsintSignal, 'id' | 'createdAt' | 'ingestedAt'>): Omit<OsintSignalRow, 'id' | 'created_at' | 'ingested_at'> {
  return {
    title: signal.title,
    content: signal.content,
    source_name: signal.sourceName,
    source_handle: signal.sourceHandle,
    source_url: signal.sourceUrl,
    geotag_lat: signal.geotagLat,
    geotag_lng: signal.geotagLng,
    location_name: signal.locationName,
    tags: signal.tags,
    category: signal.category,
    published_at: signal.publishedAt,
    external_id: signal.externalId,
    confidence_score: signal.confidenceScore,
  };
}
