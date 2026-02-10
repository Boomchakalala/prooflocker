import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getReliabilityTier } from '@/lib/user-scoring';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching - always fresh data

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Calculate a proper reputation score based on actual performance.
 * Score 0-1000 based on:
 * - Accuracy (40%): win rate drives the bulk
 * - Volume (30%): more resolved = higher score (logarithmic)
 * - Evidence quality (30%): grade distribution
 */
function calculateReputationScore(stats: {
  total_resolved: number;
  total_correct: number;
  total_incorrect: number;
  accuracy_rate: number;
  evidence_a_count: number;
  evidence_b_count: number;
  evidence_c_count: number;
  evidence_d_count: number;
}): number {
  const resolved = stats.total_resolved || 0;
  const correct = stats.total_correct || 0;

  if (resolved === 0) return 0;

  // Accuracy component (0-400): win rate * 400
  const winRate = correct / resolved;
  const accuracyScore = Math.round(winRate * 400);

  // Volume component (0-300): logarithmic scaling
  // 1 resolved = ~60, 5 = ~150, 10 = ~200, 25 = ~260, 50 = ~300
  const volumeScore = Math.min(Math.round(Math.log2(resolved + 1) * 53), 300);

  // Evidence component (0-300): weighted by grade quality
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query to get top sources
    let query = supabase
      .from('user_stats')
      .select(`
        user_id,
        credibility_score,
        total_resolved,
        total_correct,
        total_incorrect,
        accuracy_rate,
        evidence_a_count,
        evidence_b_count,
        evidence_c_count,
        evidence_d_count
      `)
      .gte('total_resolved', 1)
      .order('credibility_score', { ascending: false })
      .limit(limit);

    const { data: userStats, error } = await query;

    if (error) {
      console.error('Error fetching top sources:', error);
      return NextResponse.json(
        { error: 'Failed to fetch top sources' },
        { status: 500 }
      );
    }

    // For each user, get their pseudonym from predictions table (NOT email)
    const topSources = await Promise.all(
      (userStats || []).map(async (stats) => {
        // Get pseudonym from user's predictions
        const { data: predData } = await supabase
          .from('predictions')
          .select('pseudonym, author_number')
          .eq('user_id', stats.user_id)
          .not('pseudonym', 'is', null)
          .limit(1);

        const pseudonym = predData?.[0]?.pseudonym;
        const authorNumber = predData?.[0]?.author_number;

        // Display name: pseudonym > Anon #number > Anon #user_id_suffix
        const displayName = pseudonym
          ? `@${pseudonym}`
          : authorNumber
          ? `Anon #${authorNumber}`
          : `Anon #${stats.user_id.slice(-4)}`;

        // Calculate proper reputation score from actual stats
        const reputationScore = calculateReputationScore(stats);

        // Calculate win rate
        const resolved = stats.total_resolved || 0;
        const correct = stats.total_correct || 0;
        const winRate = resolved > 0
          ? Math.round((correct / resolved) * 100)
          : 0;

        // Get tier from calculated score
        const tier = getReliabilityTier(reputationScore);

        // If filtering by category, check if user has predictions in that category
        let categoryMatch = true;
        if (category && category !== 'all') {
          const { data: categoryPredictions } = await supabase
            .from('predictions')
            .select('id')
            .eq('user_id', stats.user_id)
            .eq('category', category)
            .limit(1);

          categoryMatch = !!(categoryPredictions && categoryPredictions.length > 0);
        }

        if (!categoryMatch) {
          return null;
        }

        return {
          userId: stats.user_id,
          displayName,
          reliabilityScore: reputationScore,
          tier,
          winRate,
          resolvedCount: resolved,
          avgEvidenceScore: Math.round(stats.accuracy_rate || 0),
        };
      })
    );

    // Filter out null entries and sort by calculated reputation score
    const filteredSources = topSources
      .filter((source) => source !== null)
      .sort((a, b) => b!.reliabilityScore - a!.reliabilityScore);

    return NextResponse.json({
      sources: filteredSources,
      count: filteredSources.length,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error in top-sources API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
