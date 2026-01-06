import { NextRequest, NextResponse } from "next/server";
import { getAllPredictions, getPredictionsByUserId } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("[Predictions API] Fetching predictions from Supabase:", { userId: userId || "all" });

    let predictions;
    if (userId) {
      predictions = await getPredictionsByUserId(userId);
    } else {
      predictions = await getAllPredictions();
    }

    console.log("[Predictions API] Fetched predictions:", {
      count: predictions.length,
      firstPreview: predictions[0]?.textPreview?.substring(0, 30),
    });

    return NextResponse.json({
      predictions,
      count: predictions.length,
    });
  } catch (error) {
    console.error("[Predictions API] Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
