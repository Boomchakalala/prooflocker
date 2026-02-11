import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { EvidenceGrade, EvidenceItemInput } from "@/lib/evidence-types";
import { validateEvidenceRequirements } from "@/lib/evidence-types";
import {
  createEvidenceLinkItem,
  createEvidenceFileItem,
  updateUserStats,
} from "@/lib/evidence-storage";
import { computeResolutionFingerprint } from "@/lib/evidence-hashing";
import { computeEvidenceScore } from "@/lib/evidence-scoring";
import { awardResolvePoints } from "@/lib/insight-db";

// ENV CHECK (one-time log)
console.log("[Resolve API] ENV CHECK:", {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Resolve ${requestId}] ==================== START ====================`);

  try {
    // STEP 1: Extract auth token
    const authHeader = request.headers.get('authorization');
    console.log(`[Resolve ${requestId}] Auth header present:`, !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[Resolve ${requestId}] NO AUTH - returning 401`);
      return NextResponse.json(
        { ok: false, error: "Unauthorized", details: "Must be logged in to resolve predictions" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // STEP 2: Validate session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(`[Resolve ${requestId}] MISSING ENV VARIABLES`);
      return NextResponse.json(
        { ok: false, error: "Configuration error", details: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const authSupabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await authSupabase.auth.getUser(accessToken);

    if (authError) {
      console.error(`[Resolve ${requestId}] Auth error:`, authError);
      return NextResponse.json(
        { ok: false, error: "Authentication failed", details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.log(`[Resolve ${requestId}] No user found`);
      return NextResponse.json(
        { ok: false, error: "Unauthorized", details: "Invalid session" },
        { status: 401 }
      );
    }

    console.log(`[Resolve ${requestId}] User authenticated:`, user.id);

    // STEP 3: Parse request
    const { id } = await params;
    const body = await request.json();
    console.log(`[Resolve ${requestId}] Prediction ID:`, id);
    console.log(`[Resolve ${requestId}] Body:`, JSON.stringify(body, null, 2));

    const {
      outcome,
      resolutionNote,
      resolutionUrl,
      evidenceGrade,
      evidenceSummary,
      evidenceItems,
    } = body;

    // STEP 4: Validate inputs
    if (!outcome || !["correct", "incorrect", "invalid"].includes(outcome)) {
      return NextResponse.json(
        { ok: false, error: "Invalid outcome", details: `Outcome must be correct, incorrect, or invalid. Got: ${outcome}` },
        { status: 400 }
      );
    }

    // Auto-calculate evidence grade based on what's provided
    const effectiveGrade = evidenceGrade && ["A", "B", "C", "D"].includes(evidenceGrade)
      ? evidenceGrade
      : (evidenceItems?.length > 0 && evidenceSummary ? "B"
        : evidenceItems?.length > 0 ? "C"
        : "D");

    // STEP 5: Check ownership using SERVICE ROLE
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error(`[Resolve ${requestId}] NO SERVICE KEY`);
      return NextResponse.json(
        { ok: false, error: "Configuration error", details: "Missing service role key" },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    const { data: prediction, error: fetchError } = await adminSupabase
      .from("predictions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error(`[Resolve ${requestId}] Fetch error:`, fetchError);
      return NextResponse.json(
        { ok: false, error: "Prediction not found", details: fetchError.message },
        { status: 404 }
      );
    }

    if (!prediction) {
      return NextResponse.json(
        { ok: false, error: "Prediction not found", details: `No prediction with id ${id}` },
        { status: 404 }
      );
    }

    if (!prediction.user_id) {
      return NextResponse.json(
        { ok: false, error: "Cannot resolve unclaimed prediction", details: "This prediction must be claimed first" },
        { status: 400 }
      );
    }

    if (prediction.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized", details: "You don't own this prediction" },
        { status: 403 }
      );
    }

    console.log(`[Resolve ${requestId}] Ownership verified`);

    // STEP 6: Process evidence items
    const evidenceHashes: string[] = [];
    const createdEvidenceItems = [];

    for (const item of evidenceItems || []) {
      try {
        if (item.type === "link" && item.url) {
          const created = await createEvidenceLinkItem(
            id,
            item.url,
            item.title,
            item.sourceKind,
            item.notes
          );
          evidenceHashes.push(created.sha256);
          createdEvidenceItems.push(created);
        } else if (item.type === "file" && item.url && item.hash) {
          const created = await createEvidenceFileItem(
            id,
            item.url,
            item.url,
            item.hash,
            item.mimeType || 'application/octet-stream',
            item.fileSizeBytes || 0,
            item.title,
            item.sourceKind,
            item.notes
          );
          evidenceHashes.push(created.sha256);
          createdEvidenceItems.push(created);
        } else if (item.hash) {
          evidenceHashes.push(item.hash);
        }
      } catch (error) {
        console.error(`[Resolve ${requestId}] Evidence item error:`, error);
        // Continue with other items
      }
    }

    console.log(`[Resolve ${requestId}] Processed ${createdEvidenceItems.length} evidence items`);

    // STEP 7: Compute fingerprint and score
    const resolutionFingerprint = await computeResolutionFingerprint({
      predictionId: id,
      outcome,
      resolvedAt: new Date().toISOString(),
      evidenceGrade: effectiveGrade,
      evidenceItemHashes: evidenceHashes,
      evidenceSummary: evidenceSummary || "",
    });

    const evidenceScoreResult = computeEvidenceScore(
      evidenceItems || [],
      evidenceSummary,
      false
    );

    console.log(`[Resolve ${requestId}] Evidence score: ${evidenceScoreResult.score}`);

    // STEP 8: Update prediction
    const updateData: Record<string, any> = {
      outcome,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_note: resolutionNote || null,
      resolution_url: resolutionUrl || null,
      evidence_grade: effectiveGrade,
      evidence_summary: evidenceSummary || null,
      resolution_fingerprint: resolutionFingerprint,
      evidence_score: evidenceScoreResult.score,
      evidence_score_breakdown: {
        score: evidenceScoreResult.score,
        tier: evidenceScoreResult.tier,
        breakdown: evidenceScoreResult.breakdown,
      },
    };

    const { error: updateError } = await adminSupabase
      .from("predictions")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error(`[Resolve ${requestId}] Update error:`, updateError);
      return NextResponse.json(
        { ok: false, error: "Failed to update prediction", details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`[Resolve ${requestId}] Prediction updated`);

    // STEP 9: Update user stats (non-fatal)
    try {
      await updateUserStats(user.id);
    } catch (error) {
      console.error(`[Resolve ${requestId}] User stats error:`, error);
    }

    // STEP 10: Award reputation points (non-fatal)
    let insightPoints = 0;
    try {
      const identifier = prediction.user_id
        ? { userId: prediction.user_id }
        : { anonId: prediction.anon_id };

      console.log(`[Resolve ${requestId}] Awarding points with identifier:`, identifier);

      const scoreResult = await awardResolvePoints({
        identifier,
        predictionId: id,
        isCorrect: outcome === 'correct',
        category: prediction.category || 'Other',
      });

      if (scoreResult) {
        insightPoints = scoreResult.points;
        console.log(`[Resolve ${requestId}] Awarded ${insightPoints} points`);
      }
    } catch (scoreError) {
      console.error(`[Resolve ${requestId}] Scoring error:`, scoreError);
      // Don't fail the request
    }

    console.log(`[Resolve ${requestId}] ==================== SUCCESS ====================`);

    return NextResponse.json({
      ok: true,
      success: true,
      outcome,
      evidenceGrade: effectiveGrade,
      resolutionFingerprint,
      evidenceItemsCreated: createdEvidenceItems.length,
      evidenceScore: evidenceScoreResult.score,
      insightPoints,
    });

  } catch (error) {
    console.error(`[Resolve ${requestId}] ==================== ERROR ====================`);
    console.error(`[Resolve ${requestId}] Error:`, error);
    console.error(`[Resolve ${requestId}] Stack:`, error instanceof Error ? error.stack : 'No stack');
    console.error(`[Resolve ${requestId}] ===========================================================`);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
