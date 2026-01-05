import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getPredictionByProofId } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { proofId, text } = await request.json();

    if (!proofId || !text) {
      return NextResponse.json(
        { error: "Proof ID and text are required" },
        { status: 400 }
      );
    }

    // Get the stored prediction
    const storedPrediction = await getPredictionByProofId(proofId);

    if (!storedPrediction) {
      return NextResponse.json({
        verified: false,
        message: "Proof ID not found. This prediction may not exist.",
      });
    }

    // Hash the provided text
    const hash = crypto.createHash("sha256").update(text).digest("hex");

    // Verify if the hash matches
    const verified = hash === storedPrediction.hash;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      verified,
      message: verified
        ? "Proof verified successfully! The text matches the original."
        : "Verification failed. The text does not match the original.",
      proofDetails: verified
        ? {
            hash: storedPrediction.hash,
            timestamp: storedPrediction.timestamp,
            dagTransaction: storedPrediction.dagTransaction,
          }
        : undefined,
    });
  } catch (error) {
    console.error("Error verifying proof:", error);
    return NextResponse.json(
      { error: "Failed to verify proof" },
      { status: 500 }
    );
  }
}
