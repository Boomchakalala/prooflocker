import { NextRequest, NextResponse } from "next/server";
import { getAllPredictions, getPredictionsByUserId, getPredictionsByAnonId } from "@/lib/storage";
import { readFileSync } from "fs";
import { join } from "path";
import { SEED_PREDICTIONS } from "@/lib/seed-predictions";

// Set maxDuration for Vercel serverless functions (in seconds)
export const maxDuration = 10; // 10 second timeout
export const dynamic = 'force-dynamic'; // Disable caching
export const revalidate = 30; // Cache for 30 seconds

// In-memory cache
let predictionsCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 20000; // 20 seconds

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
      }));

      predictions = [...seedPredictionsAsRecords, ...predictions];
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
