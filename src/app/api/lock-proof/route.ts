import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { savePrediction, type PredictionCategory } from "@/lib/storage";
import { generateAuthorNumber } from "@/lib/utils";
import { submitToDigitalEvidence, isDigitalEvidenceEnabled } from "@/lib/digitalEvidence";
import { validatePredictionContent } from "@/lib/contentFilter";
import { createClient } from "@supabase/supabase-js";
import { awardLockPoints } from "@/lib/insight-db";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { text, userId: anonId, category } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!anonId || typeof anonId !== "string") {
      return NextResponse.json(
        { error: "Anonymous ID is required" },
        { status: 400 }
      );
    }

    // Validate and default category
    const validCategories: PredictionCategory[] = ["Crypto", "Politics", "Markets", "Tech", "Sports", "Culture", "Personal", "Other"];
    const predictionCategory: PredictionCategory = category && validCategories.includes(category) ? category : "Other";

    // Validate content against moderation filter
    const validation = validatePredictionContent(text);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if user is authenticated (optional - supports both anon and authenticated)
    let authenticatedUserId: string | null = null;
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user) {
          authenticatedUserId = user.id;
          console.log("[Lock Proof API] Authenticated user creating prediction:", user.id);
        }
      } catch (authError) {
        console.warn("[Lock Proof API] Auth check failed:", authError);
        // Continue without authentication - prediction will be anonymous
      }
    }

    // Hash the text using SHA-256
    const hash = crypto.createHash("sha256").update(text).digest("hex");

    // Generate a unique proof ID and prediction ID
    const proofId = crypto.randomBytes(16).toString("hex");
    const predictionId = crypto.randomBytes(16).toString("hex");

    // Current timestamp
    const timestamp = new Date().toISOString();

    // Create text preview (first 80 chars for feed)
    const textPreview = text.length > 80 ? text.slice(0, 80) + "..." : text;

    // Generate consistent author number from anonId
    const authorNumber = generateAuthorNumber(anonId);

    // Attempt to submit to Digital Evidence if configured
    let onChainStatus: "pending" | "confirmed" = "pending";
    let deReference: string | undefined;
    let deEventId: string | undefined;
    let deStatus: string | undefined;
    let deSubmittedAt: string | undefined;
    let confirmedAt: string | undefined;
    let dagTransaction = `DAG${crypto.randomBytes(32).toString("hex")}`; // Fallback

    if (isDigitalEvidenceEnabled()) {
      deSubmittedAt = new Date().toISOString(); // Record submission time

      const deResult = await submitToDigitalEvidence(hash, {
        proofId,
        userId: anonId,
      });

      if (deResult.success && deResult.accepted) {
        // Only mark as confirmed if API accepted the submission
        onChainStatus = "confirmed";
        deEventId = deResult.eventId;
        deReference = deResult.hash || hash; // Store the fingerprint as reference
        deStatus = "CONFIRMED"; // Mark as confirmed if accepted
        confirmedAt = deResult.timestamp;
        dagTransaction = deResult.eventId || dagTransaction; // Use eventId as transaction ID
      } else {
        // Submission attempted but not yet confirmed
        deEventId = deResult.eventId; // Store eventId even if not accepted yet
        deReference = hash;
        deStatus = "PENDING"; // Will be synced later
        console.warn("[Lock Proof API] Digital Evidence submission failed or not accepted:", deResult.error || "Not accepted");
      }
    }

    // Build prediction object
    const prediction = {
      id: predictionId,
      userId: authenticatedUserId || null, // Set immediately if logged in, otherwise null until claimed
      anonId, // Anonymous identifier from localStorage
      authorNumber,
      text,
      textPreview,
      hash,
      timestamp,
      dagTransaction,
      proofId,
      publicSlug: proofId, // Use proofId as public slug for permanent links
      onChainStatus,
      outcome: "pending" as const, // Default outcome
      category: predictionCategory,
      deReference,
      deEventId,
      deStatus,
      deSubmittedAt,
      confirmedAt,
      claimedAt: authenticatedUserId ? new Date().toISOString() : undefined, // Mark as claimed if authenticated
    };

    // Save prediction to storage (Supabase)
    await savePrediction(prediction);

    // Award Reputation Score points for locking (+10 pts)
    let insightPoints = 0;
    try {
      const identifier = authenticatedUserId
        ? { userId: authenticatedUserId }
        : { anonId };

      const scoreResult = await awardLockPoints(identifier, predictionId);
      if (scoreResult) {
        insightPoints = scoreResult.points;
        console.log(`[Lock Proof API] Awarded ${insightPoints} Reputation Score points`);
      }
    } catch (scoreError) {
      console.error("[Lock Proof API] Failed to award Reputation Score:", scoreError);
      // Don't fail the request if scoring fails
    }

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      predictionId,
      proofId,
      hash,
      timestamp,
      dagTransaction,
      authorNumber,
      onChainStatus,
      deReference,
      deEventId,
      insightPoints, // Include insight points in response
    });
  } catch (error) {
    console.error("[Lock Proof API] ========== ERROR ==========");
    console.error("[Lock Proof API] Error details:", error);

    // Check for duplicate fingerprint error
    if (error instanceof Error && error.message === "DUPLICATE_FINGERPRINT") {
      return NextResponse.json(
        { error: "DUPLICATE_FINGERPRINT", message: "Already locked — this prediction fingerprint already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to lock proof" },
      { status: 500 }
    );
  }
}
