import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// In-memory storage for proofs (in production, use a database)
const proofStore = new Map<string, {
  hash: string;
  timestamp: string;
  dagTransaction: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Hash the text using SHA-256
    const hash = crypto.createHash("sha256").update(text).digest("hex");

    // Generate a unique proof ID
    const proofId = crypto.randomBytes(16).toString("hex");

    // Simulate DAG transaction (in production, this would be a real Constellation Network transaction)
    const dagTransaction = `DAG${crypto.randomBytes(32).toString("hex")}`;

    // Current timestamp
    const timestamp = new Date().toISOString();

    // Store the proof
    proofStore.set(proofId, {
      hash,
      timestamp,
      dagTransaction,
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      proofId,
      hash,
      timestamp,
      dagTransaction,
      success: true,
    });
  } catch (error) {
    console.error("Error locking proof:", error);
    return NextResponse.json(
      { error: "Failed to lock proof" },
      { status: 500 }
    );
  }
}
