import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { savePrediction } from "@/lib/storage";
import { generateAuthorNumber } from "@/lib/utils";
import { submitToDigitalEvidence, isDigitalEvidenceEnabled } from "@/lib/digitalEvidence";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { text, userId: anonId } = await request.json();

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
      userId: null, // Will be set when user claims with email
      anonId, // Anonymous identifier from localStorage
      authorNumber,
      text,
      textPreview,
      hash,
      timestamp,
      dagTransaction,
      proofId,
      onChainStatus,
      deReference,
      deEventId,
      deStatus,
      deSubmittedAt,
      confirmedAt,
    };

    // Save prediction to storage (Supabase)
    await savePrediction(prediction);

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
