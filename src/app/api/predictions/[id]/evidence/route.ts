import { NextRequest, NextResponse } from "next/server";
import { getEvidenceItemsByPrediction } from "@/lib/evidence-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all evidence items for this prediction
    const items = await getEvidenceItemsByPrediction(id);

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("[Evidence API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence items" },
      { status: 500 }
    );
  }
}
