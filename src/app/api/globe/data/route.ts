import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

// OSINT Twitter sources for ProofLocker Globe
const OSINT_SOURCES = [
  {
    handle: '@conflict_radar',
    name: 'Conflict Radar',
    tags: ['Conflicts', 'OSINT', 'Verification'],
  },
  {
    handle: '@polymarketintel',
    name: 'Polymarket Intel',
    tags: ['Prediction Markets', 'Analytics'],
  },
  {
    handle: '@IntelCrab',
    name: 'IntelCrab',
    tags: ['Intelligence', 'OSINT'],
  },
  {
    handle: '@Bellingcat',
    name: 'Bellingcat',
    tags: ['Investigations', 'Open Source'],
  },
  {
    handle: '@AuroraIntel',
    name: 'Aurora Intel',
    tags: ['Military', 'Intelligence'],
  },
];

// Generate mock OSINT data with realistic global locations
function generateOsintData() {
  const locations = [
    { lat: 50.4501, lng: 30.5234, city: 'Kyiv' },
    { lat: 52.5200, lng: 13.4050, city: 'Berlin' },
    { lat: 48.8566, lng: 2.3522, city: 'Paris' },
    { lat: 35.6762, lng: 139.6503, city: 'Tokyo' },
    { lat: -15.8267, lng: -47.9218, city: 'Brasília' },
    { lat: 55.7558, lng: 37.6173, city: 'Moscow' },
    { lat: 40.7128, lng: -74.0060, city: 'New York' },
    { lat: 31.7683, lng: 35.2137, city: 'Jerusalem' },
    { lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
    { lat: 51.5074, lng: -0.1278, city: 'London' },
    { lat: -33.8688, lng: 151.2093, city: 'Sydney' },
    { lat: 1.3521, lng: 103.8198, city: 'Singapore' },
    { lat: 25.2048, lng: 55.2708, city: 'Dubai' },
    { lat: 37.7749, lng: -122.4194, city: 'San Francisco' },
    { lat: 59.3293, lng: 18.0686, city: 'Stockholm' },
  ];

  const newsTemplates = [
    'Satellite imagery confirms infrastructure changes in {city}',
    'Investigation reveals coordinated disinformation network in {city}',
    'Video authentication confirms timeline discrepancies in {city} region',
    'Supply chain tracking reveals unusual pattern deviations near {city}',
    'Election monitoring data shows voting irregularities in {city}',
    'Energy infrastructure damage confirmed via commercial satellites near {city}',
    'Financial transaction patterns suggest laundering network in {city}',
    'Military equipment movement tracked across {city} border regions',
    'Social media manipulation campaign targets {city} regional elections',
    'Cybersecurity breach exposes government communications in {city}',
    'Public records analysis reveals pattern inconsistencies in {city}',
    'Crowdsourced verification completed with high confidence in {city}',
    'Maritime tracking data shows unusual vessel patterns near {city}',
    'Environmental monitoring detects pollution spike in {city}',
    'Forensic analysis confirms document authenticity from {city}',
  ];

  const now = Date.now();
  const hoursAgo = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 36, 48, 72];

  return locations.map((location, index) => {
    const source = OSINT_SOURCES[index % OSINT_SOURCES.length];
    const template = newsTemplates[index % newsTemplates.length];
    const title = template.replace('{city}', location.city);
    const hours = hoursAgo[index % hoursAgo.length];
    const timestamp = hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;

    return {
      id: index + 1,
      title,
      source: source.name,
      handle: source.handle,
      lat: location.lat,
      lng: location.lng,
      timestamp,
      tags: source.tags,
      createdAt: new Date(now - hours * 3600000).toISOString(),
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Globe API] Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch predictions from database with geotag fields
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('id, text, author_number, pseudonym, created_at, outcome, status, anon_id, category, public_slug, geotag_lat, geotag_lng, geotag_city, geotag_country')
      .eq('moderation_status', 'active')
      .order('created_at', { ascending: false })
      .limit(100); // Increased to get more geotagged claims

    if (error) {
      console.error('[Globe API] Error fetching predictions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch predictions', details: error.message },
        { status: 500 }
      );
    }

    console.log(`[Globe API] Fetched ${predictions?.length || 0} predictions from database`);

    // Filter predictions to only include those with geotags (for globe display)
    const geotaggedPredictions = (predictions || []).filter(
      (p: any) => p.geotag_lat !== null && p.geotag_lng !== null
    );

    console.log(`[Globe API] ${geotaggedPredictions.length} predictions have geotags`);

    // Fetch reputation scores for all users in one query
    const anonIds = [...new Set(geotaggedPredictions.map((p: any) => p.anon_id).filter(Boolean))];
    const { data: reputationData } = await supabase
      .from('insight_scores')
      .select('anon_id, total_points')
      .in('anon_id', anonIds);

    // Create a map of anon_id -> reputation score
    const reputationMap = new Map(
      (reputationData || []).map((r: any) => [r.anon_id, r.total_points])
    );

    const claims = geotaggedPredictions.map((prediction: any) => {
      // Use actual geotag coordinates from the prediction
      const lat = parseFloat(prediction.geotag_lat);
      const lng = parseFloat(prediction.geotag_lng);

      // Format user handle: use pseudonym if available, otherwise "Anon #authorNumber"
      const submitter = prediction.pseudonym
        ? `@${prediction.pseudonym}`
        : `Anon #${prediction.author_number}`;

      // Determine status from outcome
      let status: 'verified' | 'disputed' | 'void' | 'pending' = 'pending';
      let outcome: string | null = null;

      if (prediction.outcome === 'correct') {
        status = 'verified';
        outcome = 'true';
      } else if (prediction.outcome === 'incorrect') {
        status = 'disputed';
        outcome = 'false';
      } else if (prediction.outcome === 'invalid') {
        status = 'void';
        outcome = 'void';
      }

      // Calculate confidence score (mock for now, can be enhanced with actual scoring)
      const confidence = Math.floor(60 + Math.random() * 35);

      // Get actual reputation score from insight_scores table
      const rep = reputationMap.get(prediction.anon_id) || 0;

      return {
        id: prediction.id,
        publicSlug: prediction.public_slug,
        claim: prediction.text,
        category: prediction.category || 'Other',
        lat: lat,
        lng: lng,
        locationName: prediction.geotag_city || prediction.geotag_country || 'Unknown',
        status,
        submitter,
        anonId: prediction.anon_id,
        rep,
        confidence,
        lockedDate: new Date(prediction.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        outcome,
      };
    });

    // Fetch OSINT signals from database
    const { data: osintData, error: osintError } = await supabase
      .from('osint_signals')
      .select('id, title, source_name, source_handle, source_url, geotag_lat, geotag_lng, location_name, tags, category, created_at, published_at')
      .eq('status', 'active')
      .not('geotag_lat', 'is', null)
      .not('geotag_lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (osintError) {
      console.error('[Globe API] Error fetching OSINT signals:', osintError);
      // Fall back to empty array if OSINT fetch fails
    }

    console.log(`[Globe API] Fetched ${osintData?.length || 0} OSINT signals from database`);

    // Transform OSINT data to globe format
    const osint = (osintData || []).map((signal: any) => {
      const now = Date.now();
      const signalTime = new Date(signal.created_at).getTime();
      const hoursAgo = Math.floor((now - signalTime) / (1000 * 60 * 60));
      const timestamp = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

      return {
        id: signal.id,
        title: signal.title,
        source: signal.source_name,
        handle: signal.source_handle,
        lat: signal.geotag_lat,
        lng: signal.geotag_lng,
        timestamp,
        tags: signal.tags || [],
        category: signal.category,
        locationName: signal.location_name,
        createdAt: signal.created_at,
      };
    });

    console.log(`[Globe API] Returning ${claims.length} claims and ${osint.length} OSINT signals`);

    return NextResponse.json({
      claims,
      osint,
      count: {
        claims: claims.length,
        osint: osint.length,
      },
    });
  } catch (error) {
    console.error('[Globe API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
