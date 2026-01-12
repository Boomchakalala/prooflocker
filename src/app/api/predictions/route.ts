import { NextRequest, NextResponse } from "next/server";
import { getAllPredictions, getPredictionsByUserId, getPredictionsByAnonId } from "@/lib/storage";
import { readFileSync } from "fs";
import { join } from "path";

// Set maxDuration for Vercel serverless functions (in seconds)
export const maxDuration = 10; // 10 second timeout
export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const anonId = searchParams.get("anonId");

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

    return NextResponse.json({
      predictions,
      count: predictions.length,
    });
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
