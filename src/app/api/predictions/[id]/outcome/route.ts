import { NextRequest, NextResponse } from "next/server";
import { updatePredictionOutcome, type PredictionOutcome } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { outcome } = await request.json();

    if (!outcome || !["pending", "correct", "incorrect", "invalid"].includes(outcome)) {
      return NextResponse.json(
        { error: "Invalid outcome value" },
        { status: 400 }
      );
    }

    // Update the outcome (this function checks ownership)
    await updatePredictionOutcome(id, outcome as PredictionOutcome, user.id);

    return NextResponse.json({
      success: true,
      outcome,
    });
  } catch (error) {
    console.error("[Update Outcome API] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Prediction not found" },
          { status: 404 }
        );
      }
      if (error.message.includes("unclaimed")) {
        return NextResponse.json(
          { error: "Cannot set outcome for unclaimed prediction" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update outcome" },
      { status: 500 }
    );
  }
}
