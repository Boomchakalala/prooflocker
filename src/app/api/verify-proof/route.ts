import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// This should be shared with lock-proof route
// In production, use a proper database
const proofStore = new Map<string, {
  hash: string;
  timestamp: string;
  dagTransaction: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const { proofId, text } = await request.json();

    if (!proofId || !text) {
      return NextResponse.json(
        { error: "Proof ID and text are required" },
        { status: 400 }
      );
    }

    // Get the stored proof
    const storedProof = proofStore.get(proofId);

    if (!storedProof) {
      return NextResponse.json({
        verified: false,
        message: "Proof ID not found",
      });
    }

    // Hash the provided text
    const hash = crypto.createHash("sha256").update(text).digest("hex");

    // Verify if the hash matches
    const verified = hash === storedProof.hash;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      verified,
      message: verified
        ? "Proof verified successfully! The text matches the original."
        : "Verification failed. The text does not match the original.",
      proofDetails: verified ? storedProof : undefined,
    });
  } catch (error) {
    console.error("Error verifying proof:", error);
    return NextResponse.json(
      { error: "Failed to verify proof" },
      { status: 500 }
    );
  }
}
