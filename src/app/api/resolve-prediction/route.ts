import { NextRequest, NextResponse } from "next/server";
import { getServerUser, createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * POST /api/resolve-prediction
 * Allow prediction owner to set outcome (correct/incorrect/invalid)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from server-side (via cookies)
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { predictionId, outcome, resolutionNote, resolutionUrl } = body;

    // Validate input
    if (!predictionId || !outcome) {
      return NextResponse.json(
        { error: "predictionId and outcome are required" },
        { status: 400 }
      );
    }

    if (!["correct", "incorrect", "invalid", "pending"].includes(outcome)) {
      return NextResponse.json(
        { error: "Invalid outcome value" },
        { status: 400 }
      );
    }

    // Create server-side Supabase client with user's auth context
    const supabase = await createServerSupabaseClient();

    // Call Supabase RPC function (RLS will ensure only owner can resolve)
    const { data, error } = await supabase.rpc("resolve_prediction", {
      p_prediction_id: predictionId,
      p_outcome: outcome,
      p_resolution_note: resolutionNote || null,
      p_resolution_url: resolutionUrl || null,
    });

    if (error) {
      console.error("[Resolve API] RPC error:", error);

      // Provide clearer error messages for common issues
      if (error.message.includes("permission denied") || error.message.includes("policy")) {
        return NextResponse.json(
          { error: "You can only resolve your own predictions" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to resolve prediction" },
        { status: 500 }
      );
    }

    console.log("[Resolve API] Success:", data);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("[Resolve API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
