import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

function calculateRepScore(stats: {
  total_resolved: number;
  total_correct: number;
  accuracy_rate: number;
  evidence_a_count: number;
  evidence_b_count: number;
  evidence_c_count: number;
  evidence_d_count: number;
}): number {
  const resolved = stats.total_resolved || 0;
  const correct = stats.total_correct || 0;
  if (resolved === 0) return 0;
  const winRate = correct / resolved;
  const accuracyScore = Math.round(winRate * 400);
  const volumeScore = Math.min(Math.round(Math.log2(resolved + 1) * 53), 300);
  const totalEvidence = (stats.evidence_a_count || 0) + (stats.evidence_b_count || 0) +
    (stats.evidence_c_count || 0) + (stats.evidence_d_count || 0);
  let evidenceScore = 0;
  if (totalEvidence > 0) {
    const weightedEvidence = (
      (stats.evidence_a_count || 0) * 1.0 +
      (stats.evidence_b_count || 0) * 0.75 +
      (stats.evidence_c_count || 0) * 0.4 +
      (stats.evidence_d_count || 0) * 0.1
    ) / totalEvidence;
    evidenceScore = Math.round(weightedEvidence * 300);
  }
  return Math.min(accuracyScore + volumeScore + evidenceScore, 1000);
}

// Dedupe helper - creates stable key for items
function getStableKey(item: any, type: 'claim' | 'osint'): string {
  if (type === 'claim') {
    return `claim:${item.id}`;
  } else {
    // For OSINT: use source + id (or source + title hash if no id)
    if (item.id) {
      return `osint:${item.source}:${item.id}`;
    }
    // Fallback: hash title + source
    const hash = `${item.source}:${item.title}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `osint:${hash.slice(0, 50)}`;
  }
}

// Dedupe array by stable key
function dedupeByKey<T extends { key: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    if (!seen.has(item.key)) {
      seen.set(item.key, item);
    }
  }
  return Array.from(seen.values());
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || '24h'; // Time window: 24h, 7d, 30d
    const category = searchParams.get('category'); // Optional filter
    const since = searchParams.get('since'); // ISO timestamp for incremental updates

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Also use service role for user_stats lookup
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminSupabase = serviceKey ? createClient(supabaseUrl, serviceKey) : supabase;

    const now = new Date();
    const asOf = now.toISOString();

    // Calculate time window
    const windowMs = window === '24h' ? 24 * 3600000 : window === '7d' ? 7 * 86400000 : 30 * 86400000;
    const windowStart = new Date(Date.now() - windowMs);

    // Fetch claims (predictions) with geotag data
    let claimsQuery = supabase
      .from('predictions')
      .select('id, text, author_number, pseudonym, created_at, outcome, status, anon_id, category, public_slug, user_id, geotag_lat, geotag_lng, geotag_city, geotag_country, evidence_score')
      .eq('moderation_status', 'active')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (category && category !== 'all') {
      claimsQuery = claimsQuery.eq('category', category);
    }

    if (since) {
      claimsQuery = claimsQuery.gte('created_at', since);
    }

    const { data: predictions, error: claimsError } = await claimsQuery;

    if (claimsError) {
      console.error('[Activity API] Error fetching claims:', claimsError);
    }

    // Fetch OSINT signals with deduplication at source
    let osintQuery = supabase
      .from('osint_signals')
      .select('id, title, source_name, source_handle, source_url, geotag_lat, geotag_lng, location_name, tags, category, created_at, published_at, content')
      .eq('status', 'active')
      .not('geotag_lat', 'is', null)
      .not('geotag_lng', 'is', null)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (category && category !== 'all') {
      osintQuery = osintQuery.eq('category', category);
    }

    if (since) {
      osintQuery = osintQuery.gte('created_at', since);
    }

    const { data: osintData, error: osintError } = await osintQuery;

    if (osintError) {
      console.error('[Activity API] Error fetching OSINT:', osintError);
    }

    // Batch-fetch reputation scores for all users in predictions
    const userIds = [...new Set((predictions || []).map((p: any) => p.user_id).filter(Boolean))];
    const userRepMap = new Map<string, number>();

    if (userIds.length > 0) {
      const { data: userStats } = await adminSupabase
        .from('user_stats')
        .select('user_id, total_resolved, total_correct, accuracy_rate, evidence_a_count, evidence_b_count, evidence_c_count, evidence_d_count')
        .in('user_id', userIds);

      if (userStats) {
        for (const stats of userStats) {
          userRepMap.set(stats.user_id, calculateRepScore(stats));
        }
      }
    }

    // Global locations for claims (fallback if no geocoding)
    const globalLocations = [
      { lat: 40.7128, lng: -74.0060, city: 'New York, USA' },
      { lat: 51.5074, lng: -0.1278, city: 'London, UK' },
      { lat: 48.8566, lng: 2.3522, city: 'Paris, France' },
      { lat: 35.6762, lng: 139.6503, city: 'Tokyo, Japan' },
      { lat: -33.8688, lng: 151.2093, city: 'Sydney, Australia' },
      { lat: 37.7749, lng: -122.4194, city: 'San Francisco, USA' },
      { lat: 52.5200, lng: 13.4050, city: 'Berlin, Germany' },
      { lat: 55.7558, lng: 37.6173, city: 'Moscow, Russia' },
      { lat: 28.6139, lng: 77.2090, city: 'New Delhi, India' },
      { lat: -15.8267, lng: -47.9218, city: 'Brasília, Brazil' },
    ];

    // Transform claims - use real geodata when available, fallback to distributed locations
    let fallbackIndex = 0;
    const claims = (predictions || []).map((prediction: any) => {
      // Use real geotag data if available
      let lat = prediction.geotag_lat;
      let lng = prediction.geotag_lng;

      if (!lat || !lng) {
        // Fallback: distribute across global locations
        const location = globalLocations[fallbackIndex % globalLocations.length];
        // Add small random offset to avoid exact overlap
        lat = location.lat + (Math.random() - 0.5) * 2;
        lng = location.lng + (Math.random() - 0.5) * 2;
        fallbackIndex++;
      }

      const submitter = prediction.pseudonym
        ? `@${prediction.pseudonym}`
        : `Anon #${prediction.author_number}`;

      let status: 'verified' | 'disputed' | 'void' | 'pending' = 'pending';
      let outcome: string | null = null;

      if (prediction.outcome === 'correct') {
        status = 'verified';
        outcome = 'correct';
      } else if (prediction.outcome === 'incorrect') {
        status = 'disputed';
        outcome = 'incorrect';
      } else if (prediction.outcome === 'invalid') {
        status = 'void';
        outcome = 'void';
      }

      const item = {
        id: prediction.id,
        publicSlug: prediction.public_slug,
        claim: prediction.text,
        category: prediction.category || 'Other',
        lat,
        lng,
        status,
        submitter,
        anonId: prediction.anon_id,
        userId: prediction.user_id,
        rep: prediction.user_id ? (userRepMap.get(prediction.user_id) ?? 0) : 0,
        confidence: 80,
        lockedDate: new Date(prediction.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        outcome,
        createdAt: prediction.created_at,
        evidence_score: prediction.evidence_score,
        key: `claim:${prediction.id}`,
      };

      return item;
    });

    // Transform OSINT with stable keys
    const osint = (osintData || []).map((signal: any) => {
      const hoursAgo = Math.floor((Date.now() - new Date(signal.created_at).getTime()) / 3600000);
      const timestamp = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

      // Create stable key
      const key = getStableKey(
        { id: signal.id, source: signal.source_name, title: signal.title },
        'osint'
      );

      return {
        id: signal.id,
        title: signal.title,
        source: signal.source_name,
        handle: signal.source_handle,
        url: signal.source_url,
        lat: signal.geotag_lat,
        lng: signal.geotag_lng,
        timestamp,
        tags: signal.tags || [],
        category: signal.category,
        locationName: signal.location_name,
        content: signal.content,
        createdAt: signal.created_at,
        publishedAt: signal.published_at,
        key, // Stable key for deduplication
      };
    });

    // Deduplicate at server
    const dedupedClaims = dedupeByKey(claims);
    const dedupedOsint = dedupeByKey(osint);

    // Filter resolved claims
    const resolved = dedupedClaims.filter((c) => c.outcome === 'correct' || c.outcome === 'incorrect');

    // Response with metadata
    const response = {
      meta: {
        asOf, // ISO timestamp
        window,
        category: category || 'all',
        counts: {
          total: dedupedClaims.length + dedupedOsint.length,
          claims: dedupedClaims.length,
          osint: dedupedOsint.length,
          resolved: resolved.length,
        },
        cacheHit: false, // TODO: Implement caching
        queryTime: Date.now() - startTime,
      },
      claims: dedupedClaims,
      osint: dedupedOsint,
      resolved,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Activity API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
