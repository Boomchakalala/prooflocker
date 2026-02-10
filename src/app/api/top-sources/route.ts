import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getReliabilityTier } from '@/lib/user-scoring';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
      .gte('credibility_score', 30)
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

    // For each user, get their display name from auth.users
    const topSources = await Promise.all(
      (userStats || []).map(async (stats) => {
        const { data: userData } = await supabase.auth.admin.getUserById(stats.user_id);

        // Calculate win rate
        const resolved = stats.total_resolved || 0;
        const correct = stats.total_correct || 0;
        const winRate = resolved > 0
          ? Math.round((correct / resolved) * 100)
          : 0;

        // Map credibility_score (0-100) to reputation score (0-1000)
        const reputationScore = Math.min(Math.round((stats.credibility_score || 0) * 10), 1000);

        // Get tier
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
          displayName: userData?.user?.email?.split('@')[0] || `Anon #${stats.user_id.slice(-4)}`,
          reliabilityScore: reputationScore,
          tier,
          winRate,
          resolvedCount: resolved,
          avgEvidenceScore: Math.round(stats.accuracy_rate || 0),
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
