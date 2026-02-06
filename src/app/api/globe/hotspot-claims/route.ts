// Globe View: Hotspot claims endpoint
// Returns detailed claim list for a specific geographic hotspot

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '0.5'); // Default 0.5 degree (~55km at equator)
    const sort = searchParams.get('sort') || 'reliability';
    const status = searchParams.get('status') || 'all';

    if (!lat || !lng) {
      return Response.json({ error: 'Missing lat or lng parameter' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate bounding box
    const latMin = lat - radius;
    const latMax = lat + radius;
    const lngMin = lng - radius;
    const lngMax = lng + radius;

    // Query predictions within bounding box
    let query = supabase
      .from('predictions')
      .select(`
        *,
        users:user_id (
          pseudonym,
          reliability_score
        )
      `)
      .gte('geotag_lat', latMin)
      .lte('geotag_lat', latMax)
      .gte('geotag_lng', lngMin)
      .lte('geotag_lng', lngMax);

    if (status && status !== 'all') {
      if (status === 'pending') {
        query = query.eq('status', 'pending');
      } else if (status === 'resolved') {
        query = query.in('status', ['correct', 'incorrect']);
      }
    }

    const { data: predictions, error } = await query;

    if (error) {
      console.error('[Globe Hotspot Claims API] Error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!predictions || predictions.length === 0) {
      return Response.json({
        hotspot: { lat, lng },
        claims: [],
        total_claims: 0,
      });
    }

    // Sort claims
    let sortedClaims = [...predictions];
    if (sort === 'reliability') {
      sortedClaims.sort((a, b) => (b.reliability_score || 0) - (a.reliability_score || 0));
    } else if (sort === 'evidence') {
      sortedClaims.sort((a, b) => (b.evidence_score || 0) - (a.evidence_score || 0));
    } else if (sort === 'recent') {
      sortedClaims.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Format claims for response
    const formattedClaims = sortedClaims.map((claim: any) => {
      // Count evidence items
      const evidenceCount = [
        ...(claim.evidence_items || []),
        ...(claim.evidence_files || []),
        ...(claim.evidence_sources || []),
      ].length;

      return {
        id: claim.id,
        user_id: claim.user_id,
        pseudonym: claim.users?.pseudonym || `Anon #${claim.user_id.slice(0, 8)}`,
        reliability_score: claim.reliability_score || 0,
        text_preview: claim.text_preview,
        status: claim.status,
        category: claim.category,
        evidence_score: claim.evidence_score || null,
        evidence_count: evidenceCount,
        created_at: claim.created_at,
        resolved_at: claim.resolved_at || null,
        on_chain_verified: !!claim.dag_tx_id,
        dag_tx_id: claim.dag_tx_id,
        geotag_city: claim.geotag_city,
        geotag_country: claim.geotag_country,
      };
    });

    // Get average city/country from claims
    const cityCountMap = new Map<string, number>();
    predictions.forEach((p: any) => {
      if (p.geotag_city && p.geotag_country) {
        const key = `${p.geotag_city}, ${p.geotag_country}`;
        cityCountMap.set(key, (cityCountMap.get(key) || 0) + 1);
      }
    });
    const topLocation = Array.from(cityCountMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    const [city, country] = topLocation.split(', ');

    return Response.json({
      hotspot: {
        lat,
        lng,
        city: city || 'Unknown',
        country: country || 'Unknown',
      },
      claims: formattedClaims,
      total_claims: formattedClaims.length,
    });
  } catch (err) {
    console.error('[Globe Hotspot Claims API] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
