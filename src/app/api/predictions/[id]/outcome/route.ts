import { NextRequest, NextResponse } from "next/server";
import { updatePredictionOutcome, type PredictionOutcome } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { awardResolvePoints } from "@/lib/insight-db";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { outcome, resolutionNote, resolutionUrl } = await request.json();

    if (!outcome || !["pending", "correct", "incorrect", "invalid"].includes(outcome)) {
      return NextResponse.json(
        { error: "Invalid outcome value" },
        { status: 400 }
      );
    }

    // Validate resolution note length
    if (resolutionNote && resolutionNote.length > 280) {
      return NextResponse.json(
        { error: "Resolution note must be 280 characters or less" },
        { status: 400 }
      );
    }

    // Validate resolution URL format
    if (resolutionUrl && !/^https?:\/\/.+/.test(resolutionUrl)) {
      return NextResponse.json(
        { error: "Resolution URL must be a valid http or https URL" },
        { status: 400 }
      );
    }

    // Update the outcome (this function checks ownership)
    await updatePredictionOutcome(
      id,
      outcome as PredictionOutcome,
      user.id,
      resolutionNote,
      resolutionUrl
    );

    // Award Reputation Score points for resolving (if outcome is not pending)
    let insightPoints = 0;
    try {
      if (outcome !== 'pending') {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          // Get prediction data
          // Note: predictions table uses camelCase (anon_id) in database
          const { data: prediction } = await supabase
            .from('predictions')
            .select('category, anon_id, user_id')
            .eq('id', id)
            .single();

          if (prediction) {
            // Use user_id if available, otherwise fall back to anon_id
            const identifier = prediction.user_id
              ? { userId: prediction.user_id }
              : prediction.anon_id
              ? { anonId: prediction.anon_id }
              : null;

            if (identifier) {
              const isCorrect = outcome === 'correct';
              const category = prediction.category || 'Other';

              const scoreResult = await awardResolvePoints({
                identifier,
                predictionId: id,
                isCorrect,
                category,
              });

              if (scoreResult) {
                insightPoints = scoreResult.points;
                console.log(`[Outcome API] Awarded ${insightPoints} Reputation Score points to ${JSON.stringify(identifier)}`);
              }
            } else {
              console.warn('[Outcome API] No valid user identifier found for scoring');
            }
          }
        } else {
          console.warn('[Outcome API] No service role key available for scoring');
        }
      }
    } catch (scoreError) {
      console.error('[Outcome API] Failed to award Reputation Score:', scoreError);
      // Non-fatal, continue
    }

    return NextResponse.json({
      success: true,
      outcome,
      resolutionNote,
      resolutionUrl,
      insightPoints, // Include insight points in response
    });
  } catch (error) {
    console.error("[Update Outcome API] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Prediction not found" },
          { status: 404 }
        );
      }
      if (error.message.includes("unclaimed")) {
        return NextResponse.json(
          { error: "Cannot set outcome for unclaimed prediction" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update outcome" },
      { status: 500 }
    );
  }
}
