import { NextResponse } from "next/server";
import { getAllPredictionsForAdmin } from "@/lib/storage";

export async function GET() {
  try {
    const predictions = await getAllPredictionsForAdmin();

    return NextResponse.json({
      predictions,
      count: predictions.length,
    });
  } catch (error) {
    console.error("[Admin Predictions API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
