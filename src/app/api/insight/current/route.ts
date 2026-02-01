import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  InsightScore,
  InsightScoreRow,
  InsightScoreResponse,
  rowToInsightScore,
} from "@/lib/insight-types";
import { getMilestone, calculateAccuracy } from "@/lib/insight-score";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/insight/current
 * Get current user's insight score (anon or authenticated)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anonId = searchParams.get("anonId");

    // Try to get authenticated user
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.substring(7);
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user) {
        userId = user.id;
      }
    }

    // Must have either anonId or userId
    if (!anonId && !userId) {
      return NextResponse.json(
        { error: "Anonymous ID or authentication required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query insight score
    let query = supabase.from("insight_scores").select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.eq("anon_id", anonId);
    }

    const { data: scoreData, error: scoreError } = await query.single();

    // If no score exists, create a default one
    if (scoreError && scoreError.code === "PGRST116") {
      // No score found, create new
      const newScore: Partial<InsightScoreRow> = {
        anon_id: userId ? null : anonId,
        user_id: userId,
        total_points: 0,
        correct_resolves: 0,
        incorrect_resolves: 0,
        total_resolves: 0,
        current_streak: 0,
        best_streak: 0,
        category_stats: {},
        badges: [],
        locks_count: 0,
        claims_count: 0,
      };

      const { data: createdScore, error: createError } = await supabase
        .from("insight_scores")
        .insert(newScore)
        .select()
        .single();

      if (createError) {
        console.error("Error creating insight score:", createError);
        return NextResponse.json(
          { error: "Failed to create insight score" },
          { status: 500 }
        );
      }

      const score = rowToInsightScore(createdScore);
      const accuracy = calculateAccuracy(score.correctResolves, score.totalResolves);
      const milestone = getMilestone(score.totalPoints);

      // Get total user count
      const { count: totalUsers } = await supabase
        .from("insight_scores")
        .select("*", { count: "exact", head: true });

      const response: InsightScoreResponse = {
        score,
        totalUsers: totalUsers || 0,
        accuracy,
        milestone,
      };

      return NextResponse.json(response);
    }

    if (scoreError) {
      console.error("Error fetching insight score:", scoreError);
      return NextResponse.json(
        { error: "Failed to fetch insight score" },
        { status: 500 }
      );
    }

    const score = rowToInsightScore(scoreData);
    const accuracy = calculateAccuracy(score.correctResolves, score.totalResolves);
    const milestone = getMilestone(score.totalPoints);

    // Calculate rank (only if user has points)
    let rank: number | undefined;
    if (score.totalPoints > 0) {
      const { count: higherRanks } = await supabase
        .from("insight_scores")
        .select("*", { count: "exact", head: true })
        .gt("total_points", score.totalPoints);

      rank = (higherRanks || 0) + 1;
    }

    // Get total active user count (with points > 0)
    const { count: totalUsers } = await supabase
      .from("insight_scores")
      .select("*", { count: "exact", head: true })
      .gt("total_points", 0);

    const response: InsightScoreResponse = {
      score,
      rank,
      totalUsers: totalUsers || 0,
      accuracy,
      milestone,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/insight/current:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
