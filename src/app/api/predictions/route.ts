import { NextRequest, NextResponse } from "next/server";
import { getAllPredictions, getPredictionsByUserId } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let predictions;
    if (userId) {
      predictions = await getPredictionsByUserId(userId);
    } else {
      predictions = await getAllPredictions();
    }

    return NextResponse.json({
      predictions,
      count: predictions.length,
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
