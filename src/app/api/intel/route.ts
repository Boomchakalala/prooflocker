/**
 * ProofLocker OSINT Intel API
 *
 * Unified endpoint for querying intel items.
 * Used by BOTH /app feed and /globe map.
 *
 * Query Parameters:
 * - window: time window in hours (default: 24)
 * - limit: page size (default: 50, max: 200)
 * - offset: pagination offset (default: 0)
 * - requireGeo: only return items with lat/lon (default: false)
 * - tags: filter by tags (comma-separated)
 * - since: return items created after this timestamp (for "New items" detection)
 *
 * Returns:
 * {
 *   items: IntelItem[],
 *   meta: { total, hasMore, latestTimestamp, window }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Default retention window (hours)
const DEFAULT_WINDOW_HOURS = 24;
const MAX_WINDOW_HOURS = 168; // 7 days

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const windowHours = Math.min(
    parseInt(searchParams.get('window') || String(DEFAULT_WINDOW_HOURS)),
    MAX_WINDOW_HOURS
  );
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '50'),
    200
  );
  const offset = parseInt(searchParams.get('offset') || '0');
  const requireGeo = searchParams.get('requireGeo') === 'true';
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || null;
  const since = searchParams.get('since') || null;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Calculate time window
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - windowHours);

    // Build query
    let query = supabase
      .from('intel_items')
      .select('*', { count: 'exact' })
      .gte('created_at', windowStart.toISOString())
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by geo if required (for globe)
    if (requireGeo) {
      query = query.not('lat', 'is', null).not('lon', 'is', null);
    }

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Filter by "since" timestamp (for new items detection)
    if (since) {
      query = query.gt('created_at', since);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Intel API] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch intel items' },
        { status: 500 }
      );
    }

    // Get latest timestamp for "Updated Xm ago" display
    const latestTimestamp = data && data.length > 0
      ? data[0].created_at
      : null;

    return NextResponse.json({
      items: data || [],
      meta: {
        total: count || 0,
        hasMore: count ? (offset + limit < count) : false,
        latestTimestamp,
        window: windowHours,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error('[Intel API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
