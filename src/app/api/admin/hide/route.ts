import { NextRequest, NextResponse } from "next/server";
import { hidePrediction } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { id, reason } = await request.json();

    if (!id || !reason) {
      return NextResponse.json(
        { error: "Missing id or reason" },
        { status: 400 }
      );
    }

    await hidePrediction(id, reason);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Hide API] Error:", error);
    return NextResponse.json(
      { error: "Failed to hide prediction" },
      { status: 500 }
    );
  }
}
