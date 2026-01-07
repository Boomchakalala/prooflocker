import { NextRequest, NextResponse } from "next/server";
import { claimPredictions } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in to claim predictions" },
        { status: 401 }
      );
    }

    const { anonId } = await request.json();

    if (!anonId || typeof anonId !== "string") {
      return NextResponse.json(
        { error: "Anonymous ID is required" },
        { status: 400 }
      );
    }

    // Claim all predictions with this anonId
    const claimedCount = await claimPredictions(anonId, user.id);

    return NextResponse.json({
      success: true,
      claimedCount,
      userId: user.id,
      message: `Successfully claimed ${claimedCount} prediction${claimedCount !== 1 ? 's' : ''}`,
    });
  } catch (error) {
    console.error("[Claim Predictions API] Error:", error);

    return NextResponse.json(
      { error: "Failed to claim predictions" },
      { status: 500 }
    );
  }
}
