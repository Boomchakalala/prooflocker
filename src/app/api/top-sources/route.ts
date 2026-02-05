import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getReliabilityTier } from '@/lib/user-scoring';

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabase = await createClient();

    // Build query to get top sources with minimum reliability 300
    let query = supabase
      .from('user_stats')
      .select(`
        user_id,
        reliability_score,
        total_predictions,
        resolved_predictions,
        correct_predictions,
        incorrect_predictions,
        avg_evidence_score
      `)
      .gte('reliability_score', 300)
      .order('reliability_score', { ascending: false })
      .limit(limit);

    const { data: userStats, error } = await query;

    if (error) {
      console.error('Error fetching top sources:', error);
      return NextResponse.json(
        { error: 'Failed to fetch top sources' },
        { status: 500 }
      );
    }

    // For each user, get their display name from auth.users
    const topSources = await Promise.all(
      (userStats || []).map(async (stats) => {
        const { data: userData } = await supabase.auth.admin.getUserById(stats.user_id);

        // Calculate win rate
        const winRate = stats.resolved_predictions > 0
          ? Math.round((stats.correct_predictions / stats.resolved_predictions) * 100)
          : 0;

        // Get tier
        const tier = getReliabilityTier(stats.reliability_score);

        // If filtering by category, check if user has predictions in that category
        let categoryMatch = true;
        if (category && category !== 'all') {
          const { data: categoryPredictions } = await supabase
            .from('predictions')
            .select('id')
            .eq('user_id', stats.user_id)
            .eq('category', category)
            .limit(1);

          categoryMatch = (categoryPredictions && categoryPredictions.length > 0);
        }

        if (!categoryMatch) {
          return null;
        }

        return {
          userId: stats.user_id,
          displayName: userData?.user?.email?.split('@')[0] || `Anon #${stats.user_id.slice(-4)}`,
          reliabilityScore: stats.reliability_score,
          tier,
          winRate,
          resolvedCount: stats.resolved_predictions,
          avgEvidenceScore: Math.round(stats.avg_evidence_score || 0),
        };
      })
    );

    // Filter out null entries (users who didn't match category filter)
    const filteredSources = topSources.filter((source) => source !== null);

    return NextResponse.json({
      sources: filteredSources,
      count: filteredSources.length,
    });
  } catch (error) {
    console.error('Error in top-sources API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
