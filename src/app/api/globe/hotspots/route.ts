// Globe View: Hotspots aggregation endpoint
// Returns geographic hotspots with claim counts, reliability scores, and marker styling

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Anti-spam rules
const ANTI_SPAM_RULES = {
  MIN_AVG_RELIABILITY: 100,  // Hide hotspots with avg Reliability < 100
  MIN_CLAIM_COUNT: 2,         // Hide hotspots with < 2 claims
  MAX_IDENTICAL_TEXTS: 0.8,   // If > 80% claims have identical text, flag as spam
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || '7d';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const minReliability = parseInt(searchParams.get('min_reliability') || '100');

    // Calculate time cutoff
    const timeCutoffs: Record<string, number> = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    };
    const cutoff = Date.now() - (timeCutoffs[timeRange] || timeCutoffs['7d']);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query predictions with geotags
    let query = supabase
      .from('predictions')
      .select('*')
      .not('geotag_lat', 'is', null)
      .not('geotag_lng', 'is', null);

    if (timeRange !== 'all') {
      query = query.gte('created_at', new Date(cutoff).toISOString());
    }

    if (category && category !== 'all') query = query.eq('category', category);
    if (status && status !== 'all') query = query.eq('status', status);
    if (userId) query = query.eq('user_id', userId);

    const { data: predictions, error } = await query;

    if (error) {
      console.error('[Globe API] Error fetching predictions:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!predictions || predictions.length === 0) {
      return Response.json({
        hotspots: [],
        total_hotspots: 0,
        total_claims: 0,
        metadata: {
          generated_at: new Date().toISOString(),
          filters_applied: { time_range: timeRange, category: category || 'all', status: status || 'all' },
        },
      });
    }

    // Group by lat/lng (round to 1 decimal for clustering nearby claims)
    const hotspotMap = new Map<string, any>();

    for (const pred of predictions) {
      const lat = Math.round(pred.geotag_lat * 10) / 10;
      const lng = Math.round(pred.geotag_lng * 10) / 10;
      const key = `${lat},${lng}`;

      if (!hotspotMap.has(key)) {
        hotspotMap.set(key, {
          lat: pred.geotag_lat,
          lng: pred.geotag_lng,
          city: pred.geotag_city,
          country: pred.geotag_country,
          claims: [],
          reputation_scores: [],
          pending_count: 0,
          resolved_count: 0,
          correct_count: 0,
          incorrect_count: 0,
          evidence_scores: [],
          latest_claim_at: pred.created_at,
          categories: [],
          text_previews: [],
        });
      }

      const hotspot = hotspotMap.get(key)!;
      hotspot.claims.push(pred);
      hotspot.reputation_scores.push(pred.reputation_score || 0);
      hotspot.text_previews.push(pred.text_preview);

      if (pred.status === 'pending') hotspot.pending_count++;
      if (pred.status === 'correct' || pred.status === 'incorrect') {
        hotspot.resolved_count++;
        if (pred.status === 'correct') hotspot.correct_count++;
        if (pred.status === 'incorrect') hotspot.incorrect_count++;
        if (pred.evidence_score) hotspot.evidence_scores.push(pred.evidence_score);
      }

      if (new Date(pred.created_at) > new Date(hotspot.latest_claim_at)) {
        hotspot.latest_claim_at = pred.created_at;
      }

      if (pred.category) hotspot.categories.push(pred.category);
    }

    // Convert to array and calculate aggregates
    const hotspots = Array.from(hotspotMap.values())
      .map((h) => {
        const avgReliability = h.reputation_scores.reduce((a: number, b: number) => a + b, 0) / h.reputation_scores.length;
        const avgEvidence = h.evidence_scores.length > 0
          ? h.evidence_scores.reduce((a: number, b: number) => a + b, 0) / h.evidence_scores.length
          : 0;
        const accuracyPct = h.resolved_count > 0
          ? Math.round((h.correct_count / h.resolved_count) * 100)
          : 0;

        // Check for spam: identical texts
        const textCounts = new Map<string, number>();
        h.text_previews.forEach((text: string) => {
          textCounts.set(text, (textCounts.get(text) || 0) + 1);
        });
        const maxIdentical = Math.max(...Array.from(textCounts.values()));
        const isSpam = maxIdentical / h.claims.length > ANTI_SPAM_RULES.MAX_IDENTICAL_TEXTS;

        // Determine marker style
        const isFresh = Date.now() - new Date(h.latest_claim_at).getTime() < 24 * 60 * 60 * 1000;
        const isHighPending = h.pending_count > h.resolved_count;
        const isHighAccuracy = accuracyPct > 70;

        let color = '#6b7280'; // Default gray
        if (isHighPending && avgReliability > 500) color = '#ef4444'; // Red (breaking)
        else if (isHighAccuracy && avgReliability > 600) color = '#22c55e'; // Green (trusted)
        else if (h.pending_count > 0 && h.resolved_count > 0) color = '#f59e0b'; // Orange (mixed)

        let size = 'small';
        if (h.claims.length > 20) size = 'large';
        else if (h.claims.length > 5) size = 'medium';

        const pulse = isFresh && isHighPending && avgReliability > 500;

        // Get top category
        const categoryCounts = new Map<string, number>();
        h.categories.forEach((cat: string) => {
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        });
        const topCategory = Array.from(categoryCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Uncategorized';

        return {
          lat: h.lat,
          lng: h.lng,
          city: h.city,
          country: h.country,
          claim_count: h.claims.length,
          avg_reliability: Math.round(avgReliability),
          pending_count: h.pending_count,
          resolved_count: h.resolved_count,
          correct_count: h.correct_count,
          incorrect_count: h.incorrect_count,
          accuracy_pct: accuracyPct,
          avg_evidence_score: Math.round(avgEvidence * 10) / 10,
          latest_claim_at: h.latest_claim_at,
          top_category: topCategory,
          marker_style: { color, size, pulse },
          is_spam: isSpam,
        };
      })
      .filter((h) => {
        // Apply anti-spam filters
        if (h.is_spam) return false;
        if (h.avg_reliability < ANTI_SPAM_RULES.MIN_AVG_RELIABILITY) return false;
        if (h.claim_count < ANTI_SPAM_RULES.MIN_CLAIM_COUNT) return false;
        return true;
      })
      .sort((a, b) => b.claim_count - a.claim_count); // Sort by volume

    return Response.json({
      hotspots,
      total_hotspots: hotspots.length,
      total_claims: predictions.length,
      metadata: {
        generated_at: new Date().toISOString(),
        filters_applied: {
          time_range: timeRange,
          category: category || 'all',
          status: status || 'all',
          min_reliability: minReliability,
        },
      },
    });
  } catch (err) {
    console.error('[Globe API] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
