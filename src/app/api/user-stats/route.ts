import { NextRequest, NextResponse } from "next/server";
import { getUserStats } from "@/lib/evidence-storage";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stats = await getUserStats(user.id);

    if (!stats) {
      // Return default stats if none exist
      return NextResponse.json({
        success: true,
        stats: {
          userId: user.id,
          updatedAt: new Date().toISOString(),
          totalResolved: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          totalPartiallyCorrect: 0,
          evidenceACount: 0,
          evidenceBCount: 0,
          evidenceCCount: 0,
          evidenceDCount: 0,
          accuracyRate: 0,
          credibilityScore: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("[User Stats API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
