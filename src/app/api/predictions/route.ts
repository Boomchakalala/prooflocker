import { NextRequest, NextResponse } from "next/server";
import { getAllPredictions, getPredictionsByUserId, getPredictionsByAnonId } from "@/lib/storage";
import { readFileSync } from "fs";
import { join } from "path";
import { SEED_PREDICTIONS } from "@/lib/seed-predictions";
import { createClient } from "@supabase/supabase-js";

// Set maxDuration for Vercel serverless functions (in seconds)
export const maxDuration = 10; // 10 second timeout
export const dynamic = 'force-dynamic'; // Disable caching
export const revalidate = 30; // Cache for 30 seconds

// Admin Supabase client for fetching user stats
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// In-memory cache
let predictionsCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 20000; // 20 seconds

// Calculate reputation score from user stats
function calculateRepScore(stats: {
  total_resolved: number;
  total_correct: number;
  accuracy_rate: number;
  evidence_a_count: number;
  evidence_b_count: number;
  evidence_c_count: number;
  evidence_d_count: number;
}): number {
  const resolved = stats.total_resolved || 0;
  const correct = stats.total_correct || 0;
  if (resolved === 0) return 0;
  const winRate = correct / resolved;
  const accuracyScore = Math.round(winRate * 400);
  const volumeScore = Math.min(Math.round(Math.log2(resolved + 1) * 53), 300);
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

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const anonId = searchParams.get("anonId");

    // Only cache when no user filters (public feed)
    if (!userId && !anonId && predictionsCache && (Date.now() - predictionsCache.timestamp) < CACHE_TTL) {
      console.log(`[Predictions API] Cache hit (${Date.now() - startTime}ms)`);
      return NextResponse.json(predictionsCache.data);
    }

    console.log(`[Predictions API] Starting query - userId=${userId}, anonId=${anonId}`);

    let predictions;

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout after 8 seconds")), 8000);
    });

    // Race between the actual query and timeout
    const queryPromise = (async () => {
      if (userId) {
        // For authenticated users: get predictions by user_id
        return await getPredictionsByUserId(userId);
      } else if (anonId) {
        // For anonymous users: get predictions by anon_id
        return await getPredictionsByAnonId(anonId);
      } else {
        // No filter: get all predictions
        return await getAllPredictions();
      }
    })();

    try {
      predictions = await Promise.race([queryPromise, timeoutPromise]) as any;
    } catch (dbError) {
      // Fallback to cached production data for local testing
      console.log('[Predictions API] DB failed, using cached data');
      const cachePath = '/tmp/predictions-cache.json';
      const cached = JSON.parse(readFileSync(cachePath, 'utf-8'));
      predictions = cached.predictions;
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Predictions API] Query completed in ${elapsed}ms, returned ${predictions?.length || 0} predictions`);

    // Batch-fetch reputation scores from insight_scores table (correct source)
    const anonIds = [...new Set((predictions || []).map((p: any) => p.anonId || p.anon_id).filter(Boolean))];
    const userReputationMap = new Map<string, { totalPoints: number; tier: number }>();

    if (anonIds.length > 0) {
      const { data: insightScores } = await adminSupabase
        .from('insight_scores')
        .select('anon_id, total_points, correct_resolves, total_resolves')
        .in('anon_id', anonIds);

      if (insightScores) {
        for (const score of insightScores) {
          // Calculate tier based on total_points (same logic as user-scoring.ts)
          let tier = 0; // Novice
          if (score.total_points >= 800) tier = 4; // Legend
          else if (score.total_points >= 700) tier = 3; // Master
          else if (score.total_points >= 500) tier = 2; // Expert
          else if (score.total_points >= 300) tier = 1; // Trusted

          userReputationMap.set(score.anon_id, {
            totalPoints: score.total_points,
            tier: tier
          });
        }
      }
    }

    // Add reputation and tier to each prediction
    if (predictions) {
      predictions = predictions.map((p: any) => {
        const anonId = p.anonId || p.anon_id;
        const repData = anonId ? userReputationMap.get(anonId) : null;
        return {
          ...p,
          rep: repData?.totalPoints ?? 0,
          author_reputation_tier: repData?.tier ?? 0,
        };
      });
    }

    // Add seed predictions only for public feed (no user filters)
    if (!userId && !anonId && predictions) {
      const seedPredictionsAsRecords = SEED_PREDICTIONS.map(seed => ({
        id: seed.id,
        userId: null,
        anonId: seed.anonId,
        authorNumber: seed.authorNumber,
        text: seed.claim,
        textPreview: seed.claim.slice(0, 100),
        hash: seed.id,
        timestamp: seed.timestamp,
        dagTransaction: seed.id,
        proofId: seed.id,
        publicSlug: seed.id,
        onChainStatus: 'confirmed',
        outcome: seed.outcome === 'pending' ? null : seed.outcome,
        category: seed.category,
        resolutionNote: seed.resolutionNote,
        resolvedAt: seed.resolved_at,
        resolvedBy: seed.anonId,
        evidenceGrade: seed.evidenceGrade,
        evidenceSummary: seed.resolvedEvidence,
        resolutionFingerprint: null,
        deReference: null,
        deEventId: null,
        deStatus: null,
        deSubmittedAt: seed.timestamp,
        confirmedAt: seed.timestamp,
        claimedAt: seed.timestamp,
        resolutionDeHash: null,
        resolutionDeTimestamp: seed.resolved_at,
        resolutionDeReference: null,
        resolutionDeEventId: null,
        resolutionDeStatus: null,
        moderationStatus: 'active',
        createdAt: seed.timestamp,
        geotag_lat: seed.lat,
        geotag_lng: seed.lng,
        lockEvidence: seed.lockEvidence,
        isSeedData: true,
        rep: 350, // Default rep for seed data
      }));

      predictions = [...seedPredictionsAsRecords, ...predictions];
    }

    // Sort by createdAt/timestamp descending (newest first)
    if (predictions) {
      predictions.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || a.timestamp).getTime();
        const bTime = new Date(b.createdAt || b.timestamp).getTime();
        return bTime - aTime; // Descending order (newest first)
      });
    }

    const responseData = {
      predictions,
      count: predictions.length,
    };

    // Cache only public feed (no user filters)
    if (!userId && !anonId) {
      predictionsCache = {
        data: responseData,
        timestamp: Date.now(),
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[Predictions API] Error after ${elapsed}ms:`, error);

    return NextResponse.json(
      {
        error: "Failed to fetch predictions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
