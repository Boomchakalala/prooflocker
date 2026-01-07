import { NextRequest, NextResponse } from "next/server";
import { getAllPredictions, getPredictionsByUserId, getPredictionsByAnonId } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const anonId = searchParams.get("anonId");

    let predictions;
    if (userId) {
      // For authenticated users: get predictions by user_id
      predictions = await getPredictionsByUserId(userId);
    } else if (anonId) {
      // For anonymous users: get predictions by anon_id
      predictions = await getPredictionsByAnonId(anonId);
    } else {
      // No filter: get all predictions
      predictions = await getAllPredictions();
    }

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
