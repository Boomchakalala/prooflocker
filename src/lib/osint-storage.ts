/**
 * OSINT Storage Layer
 *
 * CRUD operations for OSINT signals from external APIs.
 */

import { supabase } from './supabase';
import {
  type OsintSignal,
  type OsintSignalRow,
  mapOsintSignalFromDb,
  mapOsintSignalToDb,
} from './osint-types';

export interface FetchOsintOptions {
  category?: string;
  tags?: string[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  limit?: number;
  since?: string; // ISO timestamp for incremental fetch
}

/**
 * Fetch OSINT signals with optional filters
 */
export async function fetchOsintSignals(options: FetchOsintOptions = {}): Promise<OsintSignal[]> {
  let query = supabase
    .from('osint_signals')
    .select('*')
    .order('published_at', { ascending: false });

  // Category filter
  if (options.category) {
    query = query.eq('category', options.category);
  }

  // Tags filter (contains any of the provided tags)
  if (options.tags && options.tags.length > 0) {
    query = query.contains('tags', options.tags);
  }

  // Geolocation bounds filter
  if (options.bounds) {
    query = query
      .gte('geotag_lat', options.bounds.south)
      .lte('geotag_lat', options.bounds.north)
      .gte('geotag_lng', options.bounds.west)
      .lte('geotag_lng', options.bounds.east)
      .not('geotag_lat', 'is', null)
      .not('geotag_lng', 'is', null);
  }

  // Time filter for incremental updates
  if (options.since) {
    query = query.gte('published_at', options.since);
  }

  // Limit
  query = query.limit(options.limit || 100);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching OSINT signals:', error);
    throw error;
  }

  return (data as OsintSignalRow[]).map(mapOsintSignalFromDb);
}

/**
 * Fetch a single OSINT signal by ID
 */
export async function fetchOsintSignalById(id: string): Promise<OsintSignal | null> {
  const { data, error } = await supabase
    .from('osint_signals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching OSINT signal:', error);
    return null;
  }

  return data ? mapOsintSignalFromDb(data as OsintSignalRow) : null;
}

/**
 * Insert new OSINT signals (from API ingestion)
 */
export async function insertOsintSignals(
  signals: Omit<OsintSignal, 'id' | 'createdAt' | 'ingestedAt'>[]
): Promise<OsintSignal[]> {
  const rows = signals.map(mapOsintSignalToDb);

  const { data, error } = await supabase
    .from('osint_signals')
    .insert(rows)
    .select();

  if (error) {
    console.error('Error inserting OSINT signals:', error);
    throw error;
  }

  return (data as OsintSignalRow[]).map(mapOsintSignalFromDb);
}

/**
 * Get OSINT signals by external ID (to avoid duplicates)
 */
export async function findOsintByExternalId(externalId: string): Promise<OsintSignal | null> {
  const { data, error } = await supabase
    .from('osint_signals')
    .select('*')
    .eq('external_id', externalId)
    .single();

  if (error) {
    // Not found is not an error in this case
    if (error.code === 'PGRST116') return null;
    console.error('Error finding OSINT signal:', error);
    return null;
  }

  return data ? mapOsintSignalFromDb(data as OsintSignalRow) : null;
}

/**
 * Count OSINT signals by category
 */
export async function countOsintByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('osint_signals')
    .select('category');

  if (error) {
    console.error('Error counting OSINT signals:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data) {
    const category = row.category || 'Other';
    counts[category] = (counts[category] || 0) + 1;
  }

  return counts;
}
