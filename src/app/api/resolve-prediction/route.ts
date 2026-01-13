import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { submitToDigitalEvidence, isDigitalEvidenceEnabled } from "@/lib/digitalEvidence";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST /api/resolve-prediction
 * Allow prediction owner to set outcome (correct/incorrect/invalid)
 */
export async function POST(request: NextRequest) {
  try {
    // Get the access token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client and validate the token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error("[Resolve API] Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("[Resolve API] Authenticated user:", user.id);

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
