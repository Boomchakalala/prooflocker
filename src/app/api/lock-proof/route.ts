import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { savePrediction } from "@/lib/storage";
import { generateAuthorNumber } from "@/lib/utils";

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

    // Simulate DAG transaction
    const dagTransaction = `DAG${crypto.randomBytes(32).toString("hex")}`;

    // Current timestamp
    const timestamp = new Date().toISOString();

    // Create text preview (first 80 chars for feed)
    const textPreview = text.length > 80 ? text.slice(0, 80) + "..." : text;

    // Generate consistent author number from userId
    const authorNumber = generateAuthorNumber(userId);

    // Save prediction to storage
    await savePrediction({
      id: predictionId,
      userId,
      authorNumber,
      text,
      textPreview,
      hash,
      timestamp,
      dagTransaction,
      proofId,
      onChainStatus: "pending", // Mark as pending until real DAG integration
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      predictionId,
      proofId,
      hash,
      timestamp,
      dagTransaction,
      authorNumber,
    });
  } catch (error) {
    console.error("Error locking proof:", error);
    return NextResponse.json(
      { error: "Failed to lock proof" },
      { status: 500 }
    );
  }
}
