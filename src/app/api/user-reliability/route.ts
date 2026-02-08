import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateReliabilityScore, getReliabilityTier, RELIABILITY_TIERS } from '@/lib/user-scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
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
          const avgEvidence = resolved.length > 0
            ? resolved.reduce((sum, p) => sum + (p.evidence_score || 0), 0) / resolved.length
            : 0;

          const reliabilityScore = calculateReliabilityScore({
            correctPredictions: correct.length,
            incorrectPredictions: resolved.length - correct.length,
            resolvedPredictions: resolved.length,
            avgEvidenceScore: avgEvidence,
          });

          const tier = getReliabilityTier(reliabilityScore);
          const tierInfo = RELIABILITY_TIERS[tier];

          stats[userId] = {
            tier: tier,
            label: tierInfo.label,
            score: reliabilityScore,
            color: tierInfo.color,
            bg: tierInfo.bgColor,
            border: `border-${tierInfo.color.replace('text-', '')}`,
            totalPredictions: userPreds.length,
            resolvedPredictions: resolved.length,
            correctPredictions: correct.length,
          };
        }
      }
    }

    // Fetch stats for anonymous users
    if (anonIds.length > 0) {
      const { data: anonPredictions } = await supabase
        .from('predictions')
        .select('anon_id, outcome, evidence_score')
        .in('anon_id', anonIds)
        .not('anon_id', 'is', null);

      if (anonPredictions) {
        for (const anonId of anonIds) {
          const anonPreds = anonPredictions.filter(p => p.anon_id === anonId);
          const resolved = anonPreds.filter(p => p.outcome === 'correct' || p.outcome === 'incorrect');
          const correct = anonPreds.filter(p => p.outcome === 'correct');
          const avgEvidence = resolved.length > 0
            ? resolved.reduce((sum, p) => sum + (p.evidence_score || 0), 0) / resolved.length
            : 0;

          const reliabilityScore = calculateReliabilityScore({
            correctPredictions: correct.length,
            incorrectPredictions: resolved.length - correct.length,
            resolvedPredictions: resolved.length,
            avgEvidenceScore: avgEvidence,
          });

          const tier = getReliabilityTier(reliabilityScore);
          const tierInfo = RELIABILITY_TIERS[tier];

          stats[anonId] = {
            tier: tier,
            label: tierInfo.label,
            score: reliabilityScore,
            color: tierInfo.color,
            bg: tierInfo.bgColor,
            border: `border-${tierInfo.color.replace('text-', '')}`,
            totalPredictions: anonPreds.length,
            resolvedPredictions: resolved.length,
            correctPredictions: correct.length,
          };
        }
      }
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[User Reliability API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reliability', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
