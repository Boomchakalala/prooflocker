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

    // Fetch predictions from database with correct field names
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('id, text, author_number, pseudonym, created_at, outcome, status, anon_id')
      .eq('moderation_status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Globe API] Error fetching predictions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch predictions', details: error.message },
        { status: 500 }
      );
    }

    console.log(`[Globe API] Fetched ${predictions?.length || 0} predictions from database`);

    // Transform predictions to globe format
    // For now, we'll assign random global locations to predictions
    // In a real implementation, you'd geocode the prediction content or use user-provided locations
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
      { lat: 31.7683, lng: 35.2137, city: 'Jerusalem, Israel' },
      { lat: 1.3521, lng: 103.8198, city: 'Singapore' },
      { lat: 25.2048, lng: 55.2708, city: 'Dubai, UAE' },
      { lat: 59.3293, lng: 18.0686, city: 'Stockholm, Sweden' },
      { lat: 37.5665, lng: 126.9780, city: 'Seoul, South Korea' },
      { lat: 50.8503, lng: 4.3517, city: 'Brussels, Belgium' },
      { lat: 19.4326, lng: -99.1332, city: 'Mexico City, Mexico' },
      { lat: 43.6532, lng: -79.3832, city: 'Toronto, Canada' },
      { lat: -33.9249, lng: 18.4241, city: 'Cape Town, South Africa' },
      { lat: -34.6037, lng: -58.3816, city: 'Buenos Aires, Argentina' },
    ];

    const claims = (predictions || []).slice(0, 20).map((prediction: any, index: number) => {
      const location = globalLocations[index % globalLocations.length];

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

      return {
        id: prediction.id,
        claim: prediction.text,
        lat: location.lat,
        lng: location.lng,
        status,
        submitter,
        rep: Math.floor(50 + Math.random() * 50), // Mock reputation for now
        confidence,
        lockedDate: new Date(prediction.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        outcome,
      };
    });

    // Generate OSINT data
    const osint = generateOsintData();

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
