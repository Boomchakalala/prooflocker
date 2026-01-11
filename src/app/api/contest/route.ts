import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * POST /api/create-contest
 * Allow authenticated users to contest a resolved prediction (non-owners only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { predictionId, reason } = body;

    // Validate input
    if (!predictionId || !reason) {
      return NextResponse.json(
        { error: "predictionId and reason are required" },
        { status: 400 }
      );
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10 || trimmedReason.length > 1000) {
      return NextResponse.json(
        { error: "Reason must be between 10 and 1000 characters" },
        { status: 400 }
      );
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc("create_contest", {
      p_prediction_id: predictionId,
      p_reason: trimmedReason,
    });

    if (error) {
      console.error("[Contest API] RPC error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create contest" },
        { status: 500 }
      );
    }

    console.log("[Contest API] Success:", data);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("[Contest API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/create-contest?predictionId=xyz
 * Get all contests for a prediction
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("predictionId");

    if (!predictionId) {
      return NextResponse.json(
        { error: "predictionId is required" },
        { status: 400 }
      );
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc("get_prediction_contests", {
      p_prediction_id: predictionId,
    });

    if (error) {
      console.error("[Contest API] RPC error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch contests" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      contests: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("[Contest API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
