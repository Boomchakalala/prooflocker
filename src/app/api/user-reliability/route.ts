import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getReputationTier, REPUTATION_TIERS, calculateWeightedReputation, convertEvidenceScoreToGrade, evidenceGradeToPoints } from '@/lib/reputation-scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * @deprecated This endpoint is deprecated. Use /api/user-reputation instead.
 * Kept for backward compatibility.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { userIds = [], anonIds = [] } = body;

    if (userIds.length === 0 && anonIds.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    const stats: Record<string, any> = {};

    // Fetch stats for authenticated users
    if (userIds.length > 0) {
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('user_id, reputation_score, total_predictions, resolved_predictions, correct_predictions')
        .in('user_id', userIds);

      if (userStats) {
        for (const userId of userIds) {
          const userStat = userStats.find(s => s.user_id === userId);
          const reputationScore = userStat?.reputation_score || 100;

          const tierData = getReputationTier(reputationScore);
          const tierInfo = REPUTATION_TIERS.find(t => t.name === tierData.name) || REPUTATION_TIERS[0];

          stats[userId] = {
            tier: tierData.name,
            label: tierData.name,
            score: reputationScore,
            color: tierInfo.textColor,
            bg: tierInfo.bgColor,
            border: tierInfo.borderColor,
            totalPredictions: userStat?.total_predictions || 0,
            resolvedPredictions: userStat?.resolved_predictions || 0,
            correctPredictions: userStat?.correct_predictions || 0,
          };
        }
      }
    }

    // Fetch stats for anonymous users
    if (anonIds.length > 0) {
      const { data: anonStats } = await supabase
        .from('user_stats')
        .select('user_id, reputation_score, total_predictions, resolved_predictions, correct_predictions')
        .in('user_id', anonIds);

      if (anonStats) {
        for (const anonId of anonIds) {
          const anonStat = anonStats.find(s => s.user_id === anonId);
          const reputationScore = anonStat?.reputation_score || 100;

          const tierData = getReputationTier(reputationScore);
          const tierInfo = REPUTATION_TIERS.find(t => t.name === tierData.name) || REPUTATION_TIERS[0];

          stats[anonId] = {
            tier: tierData.name,
            label: tierData.name,
            score: reputationScore,
            color: tierInfo.textColor,
            bg: tierInfo.bgColor,
            border: tierInfo.borderColor,
            totalPredictions: anonStat?.total_predictions || 0,
            resolvedPredictions: anonStat?.resolved_predictions || 0,
            correctPredictions: anonStat?.correct_predictions || 0,
          };
        }
      }
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[User Reliability API - DEPRECATED] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reputation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
