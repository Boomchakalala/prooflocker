import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * POST /api/admin-finalize
 * Admin-only: Finalize prediction with override, resolve contests
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

    // Check admin status
    if (!isAdmin(user)) {
      console.warn("[Admin Finalize] Non-admin user attempted access:", user.email);
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      predictionId,
      adminOutcome,
      adminNote,
      contestId,
      contestAction,
    } = body;

    // Validate input
    if (!predictionId || !adminOutcome) {
      return NextResponse.json(
        { error: "predictionId and adminOutcome are required" },
        { status: 400 }
      );
    }

    if (!["correct", "incorrect", "invalid", "pending"].includes(adminOutcome)) {
      return NextResponse.json(
        { error: "Invalid adminOutcome value" },
        { status: 400 }
      );
    }

    if (contestId && contestAction && !["accept", "rejected"].includes(contestAction)) {
      return NextResponse.json(
        { error: "Invalid contestAction value" },
        { status: 400 }
      );
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc("admin_finalize_prediction", {
      p_prediction_id: predictionId,
      p_admin_outcome: adminOutcome,
      p_admin_note: adminNote || null,
      p_contest_id: contestId || null,
      p_contest_action: contestAction || null,
    });

    if (error) {
      console.error("[Admin Finalize] RPC error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to finalize prediction" },
        { status: 500 }
      );
    }

    console.log("[Admin Finalize] Success:", data);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("[Admin Finalize] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
