import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  LeaderboardEntry,
  LeaderboardResponse,
  InsightScoreRow,
} from "@/lib/insight-types";
import { calculateAccuracy } from "@/lib/insight-score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cache for 5 minutes
export const revalidate = 300;

/**
 * GET /api/leaderboard
 * Get top insight scores (public leaderboard)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100);
    const search = searchParams.get("search"); // Search by Anon ID prefix

    // Use service key if available, fallback to anon key
    const supabaseKey = supabaseServiceKey || supabaseAnonKey;
    if (!supabaseServiceKey) {
      console.warn('[Leaderboard API] Service role key not configured, using anon key. Some operations may be restricted.');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from("insight_scores")
      .select("*", { count: "exact" })
      .gt("total_points", 0) // Only users with points
      .order("total_points", { ascending: false })
      .order("updated_at", { ascending: false });

    // Apply search filter if provided
    if (search) {
      // Search in anon_id (e.g., "anon-1234")
      query = query.ilike("anon_id", `%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: scores, error, count } = await query;

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    // Get predictions table to look up author_number for anon users
    const anonIds = scores
      ?.filter((s: InsightScoreRow) => s.anon_id)
      .map((s: InsightScoreRow) => s.anon_id) || [];

    const authorNumberMap: { [key: string]: number } = {};
    const pseudonymMap: { [key: string]: string } = {};

    if (anonIds.length > 0) {
      const { data: predictions } = await supabase
        .from("predictions")
        .select("anon_id, author_number, pseudonym")
        .in("anon_id", anonIds);

      if (predictions) {
        predictions.forEach((p: any) => {
          if (!authorNumberMap[p.anon_id]) {
            authorNumberMap[p.anon_id] = p.author_number;
          }
          if (p.pseudonym && !pseudonymMap[p.anon_id]) {
            pseudonymMap[p.anon_id] = p.pseudonym;
          }
        });
      }
    }

    // Transform to leaderboard entries
    const entries: LeaderboardEntry[] = (scores || []).map((score: InsightScoreRow, index: number) => {
      const rank = from + index + 1;
      const accuracy = calculateAccuracy(score.correct_resolves, score.total_resolves);

      let displayName: string;
      if (score.anon_id) {
        // Check if user has pseudonym
        if (pseudonymMap[score.anon_id]) {
          displayName = pseudonymMap[score.anon_id];
        } else {
          const authorNumber = authorNumberMap[score.anon_id] || 0;
          displayName = `Anon #${authorNumber}`;
        }
      } else {
        // Authenticated user - try to get pseudonym
        displayName = "Authenticated User"; // Fallback
        // Could enhance this to look up custom name from user profile
      }

      return {
        rank,
        displayName,
        anonId: score.anon_id || undefined,
        userId: score.user_id || undefined,
        totalPoints: score.total_points,
        accuracy,
        correctResolves: score.correct_resolves,
        totalResolves: score.total_resolves,
        currentStreak: score.current_streak,
      };
    });

    const response: LeaderboardResponse = {
      entries,
      total: count || 0,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
