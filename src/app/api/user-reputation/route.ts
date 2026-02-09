import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getReputationTier, REPUTATION_TIERS, calculateWeightedReputation, convertEvidenceScoreToGrade, evidenceGradeToPoints } from '@/lib/reputation-scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

// API route: /api/user-reputation
// Calculates user reputation scores using weighted formula
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
      const { data: userPredictions } = await supabase
        .from('predictions')
        .select('user_id, outcome, evidence_score')
        .in('user_id', userIds)
        .not('user_id', 'is', null);

      if (userPredictions) {
        for (const userId of userIds) {
          const userPreds = userPredictions.filter(p => p.user_id === userId);
          const resolved = userPreds.filter(p => p.outcome === 'correct' || p.outcome === 'incorrect');
          const correct = userPreds.filter(p => p.outcome === 'correct');

          // Calculate average evidence score (convert to grade points)
          const avgEvidence = resolved.length > 0
            ? resolved.reduce((sum, p) => {
                const grade = convertEvidenceScoreToGrade(p.evidence_score || 0);
                return sum + evidenceGradeToPoints(grade);
              }, 0) / resolved.length
            : 0;

          // Calculate weighted reputation
          const reputationCalc = calculateWeightedReputation({
            correctResolutions: correct.length,
            totalResolved: resolved.length,
            averageEvidenceScore: avgEvidence,
          });

          const tierData = getReputationTier(reputationCalc.total);
          const tierInfo = REPUTATION_TIERS.find(t => t.name === tierData.name) || REPUTATION_TIERS[0];

          stats[userId] = {
            tier: tierData.name,
            label: tierData.name,
            score: reputationCalc.total,
            color: tierInfo.textColor,
            bg: tierInfo.bgColor,
            border: tierInfo.borderColor,
            totalPredictions: userPreds.length,
            resolvedPredictions: resolved.length,
            correctPredictions: correct.length,
          };
        }
      }
    }

    // Fetch stats for anonymous users
    if (anonIds.length > 0) {
      const { data: anonStats } = await supabase
        .from('user_stats')
        .select('user_id, reputation_score, total_predictions, resolved_predictions, correct_predictions')
        .in('user_id', anonIds); // anon_ids are also stored as user_id in user_stats

      if (anonStats) {
        for (const anonId of anonIds) {
          const anonStat = anonStats.find(s => s.user_id === anonId);
          const reputationScore = anonStat?.reputation_score || 100; // Default starting reputation

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
    console.error('[User Reputation API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reputation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
