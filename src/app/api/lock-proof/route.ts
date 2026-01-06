import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { savePrediction } from "@/lib/storage";
import { generateAuthorNumber } from "@/lib/utils";
import { submitToDigitalEvidence, isDigitalEvidenceEnabled } from "@/lib/digitalEvidence";

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // Generate consistent author number from userId
    const authorNumber = generateAuthorNumber(userId);

    // Attempt to submit to Digital Evidence if configured
    let onChainStatus: "pending" | "confirmed" = "pending";
    let deReference: string | undefined;
    let deEventId: string | undefined;
    let confirmedAt: string | undefined;
    let dagTransaction = `DAG${crypto.randomBytes(32).toString("hex")}`; // Fallback

    if (isDigitalEvidenceEnabled()) {
      const deResult = await submitToDigitalEvidence(hash, {
        proofId,
        userId,
      });

      if (deResult.success) {
        onChainStatus = "confirmed";
        deReference = deResult.reference;
        deEventId = deResult.eventId;
        confirmedAt = deResult.timestamp;
        dagTransaction = deResult.reference || dagTransaction; // Use DE reference as transaction ID
      } else {
        console.warn("[Lock Proof API] Digital Evidence submission failed:", deResult.error);
      }
    }

    // Build prediction object
    const prediction = {
      id: predictionId,
      userId,
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
