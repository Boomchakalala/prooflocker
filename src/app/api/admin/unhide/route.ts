import { NextRequest, NextResponse } from "next/server";
import { unhidePrediction } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    await unhidePrediction(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Unhide API] Error:", error);
    return NextResponse.json(
      { error: "Failed to unhide prediction" },
      { status: 500 }
    );
  }
}
