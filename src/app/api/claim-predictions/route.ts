import { NextRequest, NextResponse } from "next/server";
import { claimPredictions } from "@/lib/storage";
import { createClient } from "@supabase/supabase-js";
import { ensurePublicHandle } from "@/lib/public-handle";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get the access token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client and validate the token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error("[Claim Predictions API] Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - invalid token" },
        { status: 401 }
      );
    }

    // Ensure user has a public handle (generate if first claim)
    try {
      const publicHandle = await ensurePublicHandle(user);
      console.log("[Claim Predictions API] ✓ Public handle ensured:", publicHandle);
    } catch (handleError) {
      console.error("[Claim Predictions API] Warning: Failed to ensure public handle:", handleError);
      // Continue with claim even if handle generation fails
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
