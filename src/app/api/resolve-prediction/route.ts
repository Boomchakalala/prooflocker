import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { submitToDigitalEvidence, isDigitalEvidenceEnabled } from "@/lib/digitalEvidence";
import { awardResolvePoints } from "@/lib/insight-db";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/resolve-prediction
 * Allow prediction owner to set outcome (correct/incorrect/invalid)
 * Submits resolution to Digital Evidence for immutable on-chain record
 */
export async function POST(request: NextRequest) {
  try {
    // Get the access token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client and validate the token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error("[Resolve API] Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("[Resolve API] Authenticated user:", user.id);

    const body = await request.json();
    const { predictionId, outcome, resolutionNote, resolutionUrl } = body;

    // Validate input
    if (!predictionId || !outcome) {
      return NextResponse.json(
        { error: "predictionId and outcome are required" },
        { status: 400 }
      );
    }

    if (!["correct", "incorrect", "invalid", "pending"].includes(outcome)) {
      return NextResponse.json(
        { error: "Invalid outcome value" },
        { status: 400 }
      );
    }

    // Fetch the prediction to verify ownership
    const { data: prediction, error: fetchError } = await supabase
      .from("predictions")
      .select("*")
      .eq("id", predictionId)
      .single();

    if (fetchError || !prediction) {
      console.error("[Resolve API] Prediction not found:", fetchError);
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (prediction.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only resolve your own predictions" },
        { status: 403 }
      );
    }

    // Prepare resolution data
    const resolvedAt = new Date().toISOString();

    // Create resolution hash (outcome + timestamp + prediction ID for uniqueness)
    const resolutionData = JSON.stringify({
      predictionId,
      outcome,
      resolvedAt,
      resolutionNote: resolutionNote || null,
      resolutionUrl: resolutionUrl || null,
    });
    const resolutionHash = crypto.createHash("sha256").update(resolutionData).digest("hex");

    console.log("[Resolve API] Resolution hash created:", resolutionHash);

    // Prepare update data (resolution fields)
    const updateData: Record<string, any> = {
      outcome,
      resolved_at: resolvedAt,
      resolution_note: resolutionNote || null,
      resolution_url: resolutionUrl || null,
    };

    // If outcome is being set back to pending, clear resolution data
    if (outcome === "pending") {
      updateData.resolved_at = null;
      updateData.resolution_note = null;
      updateData.resolution_url = null;
    }

    // Submit resolution to Digital Evidence (if enabled and outcome is final)
    if (isDigitalEvidenceEnabled() && outcome !== "pending") {
      console.log("[Resolve API] Submitting resolution to Digital Evidence...");

      const deResult = await submitToDigitalEvidence(resolutionHash, {
        proofId: prediction.proof_id,
        userId: user.id,
        type: "resolution",
        outcome,
      });

      // Store Digital Evidence metadata
      updateData.resolution_de_hash = resolutionHash;

      if (deResult.success && deResult.accepted) {
        console.log("[Resolve API] Resolution accepted by Digital Evidence");
        updateData.resolution_de_timestamp = deResult.timestamp;
        updateData.resolution_de_reference = deResult.hash || resolutionHash;
        updateData.resolution_de_event_id = deResult.eventId;
        updateData.resolution_de_status = "CONFIRMED";
      } else {
        console.warn("[Resolve API] Resolution DE submission not accepted:", deResult.error);
        updateData.resolution_de_event_id = deResult.eventId || null;
        updateData.resolution_de_status = "PENDING";
      }
    }

    // Update the prediction
    const { error: updateError } = await supabase
      .from("predictions")
      .update(updateData)
      .eq("id", predictionId);

    if (updateError) {
      console.error("[Resolve API] Update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to resolve prediction" },
        { status: 500 }
      );
    }

    console.log("[Resolve API] Success - Resolution recorded on-chain");

    // Award Insight Score points for resolving
    let insightPoints = 0;
    let insightBreakdown = null;
    let newStreak = 0;

    // Only award points for correct/incorrect outcomes (not "invalid" or "pending")
    if (outcome === "correct" || outcome === "incorrect") {
      try {
        const identifier = user.id
          ? { userId: user.id }
          : { anonId: prediction.anon_id };

        const scoreResult = await awardResolvePoints({
          identifier,
          predictionId,
          isCorrect: outcome === "correct",
          category: prediction.category,
        });

        if (scoreResult) {
          insightPoints = scoreResult.points;
          insightBreakdown = scoreResult.breakdown;
          newStreak = scoreResult.newStreak;
          console.log(`[Resolve API] Awarded ${insightPoints} Insight Score points (streak: ${newStreak})`);
        }
      } catch (scoreError) {
        console.error("[Resolve API] Failed to award Insight Score:", scoreError);
        // Don't fail the request if scoring fails
      }
    }

    return NextResponse.json({
      success: true,
      outcome,
      resolvedAt,
      resolutionHash,
      resolutionDeStatus: updateData.resolution_de_status || null,
      resolutionDeEventId: updateData.resolution_de_event_id || null,
      insightPoints,
      insightBreakdown,
      newStreak,
    });
  } catch (error) {
    console.error("[Resolve API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
